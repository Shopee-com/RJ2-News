import { supabase } from '@/lib/supabase'

export interface Operation {
  id: string
  name: string
  sort: number
}
export interface Locality {
  id: string
  name: string
  operation: string | null
  sort: number
}

// Leitura pública (usada no cadastro, antes do login)
export async function fetchOperations(): Promise<Operation[]> {
  const { data, error } = await supabase.from('operations').select('*').order('sort')
  if (error) throw error
  return (data ?? []) as Operation[]
}

export async function fetchLocalities(): Promise<Locality[]> {
  const { data, error } = await supabase.from('localities').select('*').order('sort')
  if (error) throw error
  return (data ?? []) as Locality[]
}

// ---------------------------------------------------------------------------
// Gestão de acessos (admin)
// ---------------------------------------------------------------------------
export interface AccessProfile {
  id: string
  email: string | null
  name: string | null
  role: 'admin' | 'viewer'
  status: 'pending' | 'approved' | 'rejected'
  operation: string | null
  locality: string | null
  opsid: string | null
  created_at: string
  locked?: boolean
  locked_at?: string | null
  failed_attempts?: number
  seatalk_code?: string | null
  two_factor_enabled?: boolean
}

export async function fetchProfiles(): Promise<AccessProfile[]> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as AccessProfile[]
}

export async function setProfileStatus(
  id: string,
  status: 'approved' | 'rejected' | 'pending',
): Promise<void> {
  const { error } = await supabase.from('profiles').update({ status }).eq('id', id)
  if (error) throw error
}

export async function setProfileRole(id: string, role: 'admin' | 'viewer'): Promise<void> {
  const { error } = await supabase.from('profiles').update({ role }).eq('id', id)
  if (error) throw error
}

// Libera uma conta bloqueada por tentativas de login (somente admin, validado no banco).
export async function unlockUser(id: string): Promise<void> {
  const { error } = await supabase.rpc('admin_unlock_user', { p_user_id: id })
  if (error) throw error
}

// ---------------------------------------------------------------------------
// Alertas de segurança (tentativas de invasão que bloquearam contas)
// ---------------------------------------------------------------------------
export interface SecurityEvent {
  id: string
  user_id: string | null
  kind: string
  label: string | null
  detail: string | null
  created_at: string
  resolved: boolean
}

export async function fetchSecurityAlerts(): Promise<SecurityEvent[]> {
  const { data, error } = await supabase
    .from('security_events')
    .select('*')
    .eq('resolved', false)
    .order('created_at', { ascending: false })
  if (error) throw error
  return (data ?? []) as SecurityEvent[]
}

export async function resolveSecurityAlert(id: string): Promise<void> {
  const { error } = await supabase
    .from('security_events')
    .update({ resolved: true, resolved_at: new Date().toISOString() })
    .eq('id', id)
  if (error) throw error
}

// ---------------------------------------------------------------------------
// 2FA via SeaTalk (config por usuário — somente admin)
// ---------------------------------------------------------------------------
export async function setSeatalkCode(id: string, code: string): Promise<void> {
  const { error } = await supabase.from('profiles').update({ seatalk_code: code || null }).eq('id', id)
  if (error) throw error
}

export async function setTwoFactor(id: string, enabled: boolean): Promise<void> {
  const patch: Record<string, unknown> = { two_factor_enabled: enabled }
  // ao desligar, zera a janela de confiança para não deixar acesso preso liberado
  if (!enabled) patch.two_factor_ok_until = null
  const { error } = await supabase.from('profiles').update(patch).eq('id', id)
  if (error) throw error
}

// ---- Integração SeaTalk (App ID / App Secret guardados no banco, lidos só pela Edge Function) ----
export interface SeatalkConfigStatus {
  has_app_id: boolean
  has_app_secret: boolean
}

export async function getSeatalkConfigStatus(): Promise<SeatalkConfigStatus> {
  const { data, error } = await supabase.rpc('seatalk_config_status')
  if (error) throw error
  return (data ?? { has_app_id: false, has_app_secret: false }) as SeatalkConfigStatus
}

export async function setSeatalkConfig(appId: string, appSecret: string): Promise<void> {
  const { error } = await supabase.rpc('set_seatalk_config', { p_app_id: appId, p_app_secret: appSecret })
  if (error) throw error
}
