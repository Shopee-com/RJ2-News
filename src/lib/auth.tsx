import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { supabase } from './supabase'

export interface Profile {
  id: string
  email: string | null
  role: 'admin' | 'viewer'
  status: 'pending' | 'approved' | 'rejected'
  name: string | null
  operation: string | null
  locality: string | null
  opsid: string | null
  photo: string | null
  locked?: boolean
  two_factor_enabled?: boolean
  two_factor_ok_until?: string | null
  seatalk_code?: string | null
}

export interface ProfileEdit {
  name: string
  photo: string
  operation: string
  locality: string
}

export interface SignUpParams {
  name: string
  operation: string
  locality: string
  password: string
  email?: string
  opsid?: string
}

interface AuthState {
  session: Session | null
  profile: Profile | null
  isAdmin: boolean
  isApproved: boolean
  isLocked: boolean
  needs2FA: boolean
  loading: boolean
  signIn: (identifier: string, password: string) => Promise<{ error: string | null }>
  signUp: (p: SignUpParams) => Promise<{ error: string | null }>
  request2FA: () => Promise<{ ok?: boolean; skip?: boolean; error?: string; expires_at?: string }>
  signOut: () => Promise<void>
  updatePassword: (password: string) => Promise<{ error: string | null }>
  updateMyProfile: (fields: ProfileEdit) => Promise<{ error: string | null }>
  refreshProfile: () => Promise<void>
}

// OpsID vira um e-mail interno (para quem não tem e-mail corporativo).
const OPSID_DOMAIN = 'opsid.reversa'
export function identifierToEmail(identifier: string): string {
  const id = identifier.trim()
  return id.includes('@') ? id.toLowerCase() : `${id.toLowerCase()}@${OPSID_DOMAIN}`
}

const AuthCtx = createContext<AuthState | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [profile, setProfile] = useState<Profile | null>(null)
  const [loading, setLoading] = useState(true)

  async function loadProfile(userId: string) {
    const { data } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
    setProfile((data as Profile) ?? null)
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session)
      if (data.session) loadProfile(data.session.user.id).finally(() => setLoading(false))
      else setLoading(false)
    })

    const { data: sub } = supabase.auth.onAuthStateChange((_event, s) => {
      setSession(s)
      if (s) loadProfile(s.user.id)
      else setProfile(null)
    })

    return () => sub.subscription.unsubscribe()
  }, [])

  async function signIn(identifier: string, password: string) {
    const email = identifierToEmail(identifier)
    const { error } = await supabase.auth.signInWithPassword({ email, password })

    if (error) {
      // Registra a tentativa falha e verifica se a conta foi bloqueada.
      let locked = false
      let attempts = 0
      let max = 5
      try {
        const { data } = await supabase.rpc('record_login_failure', { p_identifier: identifier })
        if (data) {
          locked = !!data.locked
          attempts = data.attempts ?? 0
          max = data.max ?? 5
        }
      } catch {
        /* silencioso: nunca revela detalhes na tela de login */
      }
      if (locked) {
        return {
          error:
            'Conta bloqueada após várias tentativas incorretas. Procure um administrador para liberar o acesso.',
        }
      }
      const restantes = Math.max(0, max - attempts)
      if (attempts > 0 && restantes <= 2) {
        return { error: `${traduzErro(error.message)} — restam ${restantes} tentativa(s) antes do bloqueio.` }
      }
      return { error: traduzErro(error.message) }
    }

    // Login OK: zera o contador (não desbloqueia contas já bloqueadas).
    try {
      await supabase.rpc('login_reset_on_success')
    } catch {
      /* ignora */
    }
    return { error: null }
  }

  async function signUp(p: SignUpParams) {
    const identifier = p.email?.trim() || p.opsid?.trim() || ''
    if (!identifier) return { error: 'Informe um e-mail ou um OpsID.' }
    const email = identifierToEmail(identifier)

    const { error } = await supabase.auth.signUp({
      email,
      password: p.password,
      options: {
        data: {
          name: p.name,
          operation: p.operation,
          locality: p.locality,
          opsid: p.opsid?.trim() ?? '',
        },
      },
    })
    if (error) return { error: traduzErro(error.message) }

    // auto-confirmado no banco → já autentica para mostrar a tela de "aguardando aprovação"
    await supabase.auth.signInWithPassword({ email, password: p.password })
    return { error: null }
  }

  async function signOut() {
    // Zera a janela de confiança do 2FA para exigir nova aprovação no próximo login.
    try {
      await supabase.rpc('clear_my_2fa')
    } catch {
      /* ignora — segue com o logout mesmo assim */
    }
    await supabase.auth.signOut()
  }

  // Dispara a solicitação de aprovação no SeaTalk (a Edge Function envia a mensagem).
  async function request2FA() {
    try {
      const { data, error } = await supabase.functions.invoke('seatalk-2fa', { body: {} })
      if (error) return { error: error.message }
      return (data ?? {}) as { ok?: boolean; skip?: boolean; error?: string; expires_at?: string }
    } catch (e) {
      return { error: (e as Error).message }
    }
  }

  async function updatePassword(password: string) {
    const { error } = await supabase.auth.updateUser({ password })
    return { error: error ? traduzErro(error.message) : null }
  }

  async function updateMyProfile(fields: ProfileEdit) {
    const { error } = await supabase.rpc('update_my_profile', {
      p_name: fields.name,
      p_photo: fields.photo,
      p_operation: fields.operation,
      p_locality: fields.locality,
    })
    if (error) return { error: error.message }
    if (session) await loadProfile(session.user.id)
    return { error: null }
  }

  return (
    <AuthCtx.Provider
      value={{
        session,
        profile,
        isAdmin: profile?.role === 'admin',
        isApproved:
          (profile?.status === 'approved' || profile?.role === 'admin') &&
          !(profile?.locked && profile?.role !== 'admin') &&
          (!profile?.two_factor_enabled ||
            (!!profile?.two_factor_ok_until && new Date(profile.two_factor_ok_until).getTime() > Date.now())),
        isLocked: !!profile?.locked && profile?.role !== 'admin',
        needs2FA:
          !!session &&
          (profile?.status === 'approved' || profile?.role === 'admin') &&
          !(profile?.locked && profile?.role !== 'admin') &&
          !!profile?.two_factor_enabled &&
          !(!!profile?.two_factor_ok_until && new Date(profile.two_factor_ok_until).getTime() > Date.now()),
        loading,
        signIn,
        signUp,
        request2FA,
        signOut,
        updatePassword,
        updateMyProfile,
        refreshProfile: async () => {
          if (session) await loadProfile(session.user.id)
        },
      }}
    >
      {children}
    </AuthCtx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthCtx)
  if (!ctx) throw new Error('useAuth deve ser usado dentro de AuthProvider')
  return ctx
}

function traduzErro(msg: string): string {
  if (/invalid login credentials/i.test(msg)) return 'E-mail/OpsID ou senha inválidos.'
  if (/email not confirmed/i.test(msg)) return 'Cadastro ainda não confirmado.'
  if (/user already registered/i.test(msg)) return 'Já existe um cadastro com esse e-mail/OpsID.'
  if (/password should be at least/i.test(msg)) return 'A senha deve ter pelo menos 6 caracteres.'
  return msg
}
