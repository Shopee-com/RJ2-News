import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { LogIn, User, Lock, Loader2, Newspaper, ShieldAlert, KeyRound } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'

const FN_URL =
  (import.meta.env.VITE_SUPABASE_URL ?? 'https://pjhzbefheinbjcdywuma.supabase.co') +
  '/functions/v1/seatalk-2fa'

export default function Login() {
  const { session, isAdmin, isApproved, loading } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const [identifier, setIdentifier] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [magicPhase, setMagicPhase] = useState<'idle' | 'sending' | 'waiting'>('idle')
  const [blocked, setBlocked] = useState(false) // conta existe, mas o bot não alcança → admin
  // Break-glass: acesso de emergência SÓ para admin (usado se o SeaTalk cair)
  const [emergency, setEmergency] = useState(false)
  const [password, setPassword] = useState('')
  const [checkingAdmin, setCheckingAdmin] = useState(false)
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  const from = (location.state as { from?: string })?.from

  useEffect(() => {
    // Não navega enquanto valida se o break-glass é de um admin
    if (checkingAdmin) return
    if (!loading && session) {
      navigate(isApproved ? (from ?? (isAdmin ? '/admin' : '/')) : '/', { replace: true })
    }
  }, [session, isAdmin, isApproved, loading, from, navigate, checkingAdmin])

  useEffect(() => () => { if (pollRef.current) clearInterval(pollRef.current) }, [])

  function stopPolling() { if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null } }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setBlocked(false)
    const email = identifier.trim().toLowerCase()

    setMagicPhase('sending')
    try {
      const r = await fetch(`${FN_URL}?magic=request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      const data = await r.json().catch(() => ({}))
      if (data?.rate_limited) {
        setMagicPhase('idle')
        setError('Muitos pedidos seguidos. Aguarde ~2 minutos e tente de novo.')
        return
      }
      if (data?.fallback === 'signup') {
        // Sem conta cadastrada → leva para o cadastro
        setMagicPhase('idle')
        navigate('/cadastro', { state: { email } })
        return
      }
      if (!r.ok || !data?.token) {
        // Tem conta, mas o bot não alcança (fora do subteam) → liberação do admin
        setMagicPhase('idle')
        setBlocked(true)
        return
      }
      setMagicPhase('waiting')
      startPolling(data.token, email)
    } catch {
      setMagicPhase('idle')
      setError('Falha de conexão. Tente novamente.')
    }
  }

  // Break-glass: login por senha, liberado APENAS se a conta for admin.
  async function emergencySubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setCheckingAdmin(true)
    const id = identifier.trim().toLowerCase()
    const email = id.includes('@') ? id : `${id}@opsid.reversa`
    const { data, error: err } = await supabase.auth.signInWithPassword({ email, password })
    if (err || !data?.user) {
      setCheckingAdmin(false)
      setError('E-mail ou senha inválidos.')
      return
    }
    // Confere se é admin — senão, encerra a sessão na hora
    const { data: prof } = await supabase.from('profiles').select('role').eq('id', data.user.id).maybeSingle()
    if (prof?.role !== 'admin') {
      await supabase.auth.signOut()
      setCheckingAdmin(false)
      setPassword('')
      setError('Acesso de emergência é apenas para administradores.')
      return
    }
    setPassword('')
    setCheckingAdmin(false) // libera o efeito para navegar (sessão de admin válida)
  }

  function startPolling(tk: string, email: string) {
    let tries = 0
    stopPolling()
    pollRef.current = setInterval(async () => {
      tries++
      if (tries > 60) { stopPolling(); setMagicPhase('idle'); setError('Tempo esgotado. Tente de novo.'); return }
      try {
        const r = await fetch(`${FN_URL}?magic=poll&token=${tk}`)
        const d = await r.json().catch(() => ({}))
        if (d?.status === 'approved') {
          stopPolling()
          const ok = await openSession(email, d.otp, d.token_hash)
          if (!ok) { setMagicPhase('idle'); setError('Aprovado, mas falhou ao abrir a sessão. Tente de novo.') }
          // sucesso: o AuthProvider capta a sessão e o efeito acima navega
        } else if (d?.status === 'rejected') {
          stopPolling(); setMagicPhase('idle'); setError('Acesso recusado no SeaTalk.')
        } else if (d?.status === 'expired' || d?.status === 'invalid') {
          stopPolling(); setMagicPhase('idle'); setError('A solicitação expirou. Tente de novo.')
        }
      } catch { /* segue tentando */ }
    }, 3000)
  }

  // Abre a sessão com o OTP/token do magic link (tenta os formatos possíveis).
  async function openSession(email: string, otp?: string, tokenHash?: string): Promise<boolean> {
    if (otp) {
      const { error } = await supabase.auth.verifyOtp({ email, token: otp, type: 'email' })
      if (!error) return true
    }
    if (tokenHash) {
      let r = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'magiclink' })
      if (!r.error) return true
      r = await supabase.auth.verifyOtp({ token_hash: tokenHash, type: 'email' })
      if (!r.error) return true
    }
    return false
  }

  const inputCls = 'h-11 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-orange'
  const waiting = magicPhase === 'waiting'

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-dark text-orange">
            <Newspaper size={26} />
          </span>
          <h1 className="text-xl font-extrabold">
            <span className="text-dark">JORNAL</span> <span className="text-orange">REVERSA</span>
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">Entre para acessar o portal</p>
        </div>

        {emergency ? (
          /* ---- Break-glass: acesso de emergência (admin) ---- */
          <form onSubmit={emergencySubmit} className="card space-y-4 p-6">
            <div className="flex items-center gap-2">
              <KeyRound size={16} className="text-orange" />
              <h2 className="text-sm font-bold text-ink">Acesso de emergência (admin)</h2>
            </div>
            <p className="text-xs text-ink-secondary">
              Use apenas se o SeaTalk estiver indisponível. Válido <strong>somente para administradores</strong>.
            </p>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-secondary">E-mail ou OpsID</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input required value={identifier} onChange={(e) => setIdentifier(e.target.value)} placeholder="e-mail@shopee.com" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-secondary">Senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input type="password" required value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" className={inputCls} />
              </div>
            </div>
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-danger">{error}</p>}
            <button type="submit" disabled={checkingAdmin} className="btn-primary w-full disabled:opacity-60">
              {checkingAdmin ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              Entrar como admin
            </button>
            <p className="text-center text-xs text-ink-muted">
              <button type="button" onClick={() => { setEmergency(false); setError(null); setPassword('') }} className="font-semibold text-orange hover:text-orange-hover">
                Voltar ao login normal
              </button>
            </p>
          </form>
        ) : blocked ? (
          <div className="card p-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-light text-orange">
              <ShieldAlert size={22} />
            </span>
            <h2 className="text-base font-bold text-ink">Acesso pendente de liberação</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Não conseguimos verificar seu acesso pelo SeaTalk (sua conta está fora do subteam autorizado).
              Um <strong>administrador</strong> precisa liberar seu acesso.
            </p>
            <button onClick={() => { setBlocked(false); setIdentifier('') }} className="btn-ghost mt-5 w-full">
              Tentar outro e-mail
            </button>
          </div>
        ) : (
          <form onSubmit={onSubmit} className="card space-y-4 p-6">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-secondary">E-mail corporativo</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  required
                  type="email"
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e-mail@shopee.com"
                  disabled={waiting}
                  className={inputCls}
                />
              </div>
            </div>

            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-danger">{error}</p>}

            {waiting ? (
              <div className="rounded-lg border border-orange/25 bg-orange-light px-3 py-3 text-center">
                <Loader2 size={20} className="mx-auto mb-1 animate-spin text-orange" />
                <p className="text-xs font-semibold text-orange-hover">Aguardando aprovação no SeaTalk…</p>
                <p className="mt-0.5 text-[11px] text-ink-secondary">Abra o bot <strong>Jornada Reversa</strong> e toque em <strong>Aprovar</strong>.</p>
              </div>
            ) : (
              <button type="submit" disabled={magicPhase === 'sending'} className="btn-primary w-full disabled:opacity-60">
                {magicPhase === 'sending' ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                Entrar
              </button>
            )}

            <div className="space-y-1 text-center">
              <p className="text-xs text-ink-muted">
                Não tem acesso?{' '}
                <Link to="/cadastro" className="font-semibold text-orange hover:text-orange-hover">Solicitar cadastro</Link>
              </p>
              <p className="text-[11px] text-ink-muted">
                <button type="button" onClick={() => { setEmergency(true); setError(null) }} className="hover:text-ink-secondary">
                  Acesso de emergência (admin)
                </button>
              </p>
            </div>
          </form>
        )}
      </div>
    </div>
  )
}
