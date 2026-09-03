import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Check, X, ArrowLeft, Shield, User, RotateCcw, Lock, Unlock, ShieldAlert, Smartphone, KeyRound } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import FilterTabs from '@/components/ui/FilterTabs'
import EmptyState from '@/components/ui/EmptyState'
import {
  fetchProfiles,
  setProfileStatus,
  setProfileRole,
  unlockUser,
  fetchSecurityAlerts,
  resolveSecurityAlert,
  setSeatalkCode,
  setTwoFactor,
  getSeatalkConfigStatus,
  setSeatalkConfig,
  type AccessProfile,
  type SecurityEvent,
  type SeatalkConfigStatus,
} from '@/data/access'
import { formatDateTime } from '@/lib/format'
import { useAuth } from '@/lib/auth'

const TABS = ['Pendentes', 'Aprovados', 'Bloqueados', 'Todos']

export default function AdminAccess() {
  const { profile: me } = useAuth()
  const [rows, setRows] = useState<AccessProfile[]>([])
  const [alerts, setAlerts] = useState<SecurityEvent[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [tab, setTab] = useState('Pendentes')

  // Integração SeaTalk
  const [stStatus, setStStatus] = useState<SeatalkConfigStatus | null>(null)
  const [stAppId, setStAppId] = useState('')
  const [stAppSecret, setStAppSecret] = useState('')
  const [stSaving, setStSaving] = useState(false)
  const [stMsg, setStMsg] = useState('')

  async function load() {
    setLoading(true)
    try {
      const [profiles, sec, cfg] = await Promise.all([
        fetchProfiles(),
        fetchSecurityAlerts(),
        getSeatalkConfigStatus().catch(() => null),
      ])
      setRows(profiles)
      setAlerts(sec)
      setStStatus(cfg)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  async function saveSeatalk() {
    if (!stAppId.trim() || !stAppSecret.trim()) {
      setStMsg('Preencha o App ID e o App Secret.')
      return
    }
    setStSaving(true)
    setStMsg('')
    try {
      await setSeatalkConfig(stAppId.trim(), stAppSecret.trim())
      setStAppId('')
      setStAppSecret('')
      setStMsg('✓ Credenciais salvas.')
      setStStatus(await getSeatalkConfigStatus())
    } catch (e) {
      setStMsg('Erro ao salvar: ' + (e as Error).message)
    } finally {
      setStSaving(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  async function act(id: string, fn: () => Promise<void>) {
    setBusy(id)
    setError(null)
    try {
      await fn()
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(null)
    }
  }

  async function toggle2FA(p: AccessProfile) {
    if (!p.two_factor_enabled) {
      let code = p.seatalk_code || ''
      if (!code) {
        code = window.prompt('Código do SeaTalk (employee code) deste usuário, para o 2FA:', '') || ''
        if (!code.trim()) return
      }
      await act(p.id, async () => {
        await setSeatalkCode(p.id, code.trim())
        await setTwoFactor(p.id, true)
      })
    } else {
      await act(p.id, () => setTwoFactor(p.id, false))
    }
  }

  async function editSeatalkCode(p: AccessProfile) {
    const code = window.prompt('Código do SeaTalk (employee code):', p.seatalk_code || '')
    if (code === null) return
    await act(p.id, () => setSeatalkCode(p.id, code.trim()))
  }

  const filtered = rows.filter((r) => {
    if (tab === 'Pendentes') return r.status === 'pending'
    if (tab === 'Aprovados') return r.status === 'approved'
    if (tab === 'Bloqueados') return !!r.locked
    return true
  })

  const pendingCount = rows.filter((r) => r.status === 'pending').length
  const lockedCount = rows.filter((r) => r.locked).length

  return (
    <>
      <PageHeader
        eyebrow="Painel Administrativo"
        title="Aprovação de acessos"
        subtitle="Aprove ou recuse os pedidos de acesso ao portal."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Admin', to: '/admin' }, { label: 'Acessos' }]}
        actions={<Link to="/admin" className="btn-ghost"><ArrowLeft size={15} /> Painel</Link>}
      />

      <div className="portal-container py-6">
        <div className="mb-4 flex items-center justify-between gap-3">
          <FilterTabs options={TABS} value={tab} onChange={setTab} />
          <div className="flex items-center gap-2">
            {lockedCount > 0 && (
              <Badge tone="danger"><Lock size={11} /> {lockedCount} bloqueada(s)</Badge>
            )}
            {pendingCount > 0 && (
              <Badge tone="warn">{pendingCount} pendente(s)</Badge>
            )}
          </div>
        </div>

        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

        <div className="mb-5 rounded-xl border border-line bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <KeyRound size={18} className="text-orange" />
            <h2 className="text-sm font-bold text-ink">Integração SeaTalk (2FA)</h2>
            {stStatus && (
              <span
                className={`ml-auto rounded-md px-2 py-0.5 text-xs font-semibold ${
                  stStatus.has_app_id && stStatus.has_app_secret
                    ? 'bg-success/15 text-success'
                    : 'bg-warn/15 text-warn'
                }`}
              >
                {stStatus.has_app_id && stStatus.has_app_secret ? 'Configurado' : 'Falta configurar'}
              </span>
            )}
          </div>
          <p className="mb-3 text-xs text-ink-muted">
            Cole aqui as credenciais do bot (SeaTalk → app → Basic Info &amp; Credentials → Credentials).
            Elas ficam guardadas com segurança e não aparecem de volta.
          </p>
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="text-xs font-semibold text-ink-secondary">
              App ID
              <input
                value={stAppId}
                onChange={(e) => setStAppId(e.target.value)}
                placeholder={stStatus?.has_app_id ? '•••••• (já salvo — cole para trocar)' : 'Cole o App ID'}
                className="mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm font-normal outline-none focus:border-orange"
              />
            </label>
            <label className="text-xs font-semibold text-ink-secondary">
              App Secret
              <input
                type="password"
                value={stAppSecret}
                onChange={(e) => setStAppSecret(e.target.value)}
                placeholder={stStatus?.has_app_secret ? '•••••• (já salvo — cole para trocar)' : 'Cole o App Secret'}
                className="mt-1 h-10 w-full rounded-lg border border-line px-3 text-sm font-normal outline-none focus:border-orange"
              />
            </label>
          </div>
          <div className="mt-3 flex items-center gap-3">
            <button onClick={saveSeatalk} disabled={stSaving} className="btn-primary disabled:opacity-60">
              {stSaving ? <Loader2 size={15} className="animate-spin" /> : <Check size={15} />} Salvar credenciais
            </button>
            {stMsg && <span className="text-xs text-ink-secondary">{stMsg}</span>}
          </div>
        </div>

        {alerts.length > 0 && (
          <div className="mb-5 rounded-xl border border-danger/30 bg-red-50/60 p-4">
            <div className="mb-3 flex items-center gap-2">
              <ShieldAlert size={18} className="text-danger" />
              <h2 className="text-sm font-bold text-danger">
                Alerta de segurança — {alerts.length} tentativa(s) de invasão
              </h2>
            </div>
            <ul className="space-y-2">
              {alerts.map((a) => (
                <li key={a.id} className="flex flex-col gap-2 rounded-lg border border-line bg-white p-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">
                      Conta bloqueada: {a.label || '(desconhecida)'}
                    </p>
                    <p className="mt-0.5 text-xs text-ink-muted">
                      {a.detail} · {formatDateTime(a.created_at)}
                    </p>
                  </div>
                  <div className="flex shrink-0 items-center gap-2">
                    {a.user_id && (
                      <button
                        onClick={() => a.user_id && act(a.user_id, () => unlockUser(a.user_id as string))}
                        disabled={busy === a.user_id}
                        className="flex items-center gap-1.5 rounded-lg bg-orange px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-hover disabled:opacity-60"
                      >
                        <Unlock size={13} /> Liberar acesso
                      </button>
                    )}
                    <button
                      onClick={() => act(a.id, () => resolveSecurityAlert(a.id))}
                      disabled={busy === a.id}
                      className="rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:border-ink hover:text-ink disabled:opacity-60"
                    >
                      Dispensar
                    </button>
                  </div>
                </li>
              ))}
            </ul>
            <p className="mt-3 text-xs text-ink-muted">
              Uma conta é bloqueada após 5 tentativas de senha incorretas. Libere o acesso apenas se
              reconhecer o titular; caso contrário, mantenha bloqueada e investigue.
            </p>
          </div>
        )}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange" size={28} /></div>
        ) : filtered.length === 0 ? (
          <EmptyState message="Nenhum acesso nesta aba." />
        ) : (
          <div className="card divide-y divide-line">
            {filtered.map((p) => {
              const isMe = p.id === me?.id
              return (
                <div key={p.id} className="p-4">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="truncate text-sm font-semibold text-ink">{p.name || '(sem nome)'}</p>
                      {p.role === 'admin' && <Badge tone="orange"><Shield size={11} /> Admin</Badge>}
                      <Badge tone={p.status === 'approved' ? 'success' : p.status === 'rejected' ? 'danger' : 'warn'}>
                        {p.status === 'approved' ? 'Aprovado' : p.status === 'rejected' ? 'Recusado' : 'Pendente'}
                      </Badge>
                      {p.locked && <Badge tone="danger"><Lock size={11} /> Bloqueada</Badge>}
                    </div>
                    <p className="mt-0.5 truncate text-xs text-ink-muted">
                      {p.opsid ? `OpsID: ${p.opsid}` : p.email} · {p.operation || '—'} · {p.locality || '—'}
                    </p>
                  </div>

                  {!isMe && (
                    <div className="flex shrink-0 flex-wrap items-center gap-2">
                      {p.locked && (
                        <button
                          onClick={() => act(p.id, () => unlockUser(p.id))}
                          disabled={busy === p.id}
                          className="flex items-center gap-1.5 rounded-lg bg-orange px-3 py-1.5 text-xs font-semibold text-white hover:bg-orange-hover disabled:opacity-60"
                        >
                          {busy === p.id ? <Loader2 size={13} className="animate-spin" /> : <Unlock size={13} />} Liberar
                        </button>
                      )}
                      {p.status !== 'approved' && (
                        <button
                          onClick={() => act(p.id, () => setProfileStatus(p.id, 'approved'))}
                          disabled={busy === p.id}
                          className="flex items-center gap-1.5 rounded-lg bg-success px-3 py-1.5 text-xs font-semibold text-white hover:opacity-90 disabled:opacity-60"
                        >
                          {busy === p.id ? <Loader2 size={13} className="animate-spin" /> : <Check size={13} />} Aprovar
                        </button>
                      )}
                      {p.status === 'pending' && (
                        <button
                          onClick={() => act(p.id, () => setProfileStatus(p.id, 'rejected'))}
                          disabled={busy === p.id}
                          className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-danger hover:border-danger disabled:opacity-60"
                        >
                          <X size={13} /> Recusar
                        </button>
                      )}
                      {p.status === 'approved' && (
                        <button
                          onClick={() => act(p.id, () => setProfileStatus(p.id, 'pending'))}
                          disabled={busy === p.id}
                          className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:border-orange hover:text-orange disabled:opacity-60"
                        >
                          <RotateCcw size={13} /> Revogar
                        </button>
                      )}
                      <button
                        onClick={() => act(p.id, () => setProfileRole(p.id, p.role === 'admin' ? 'viewer' : 'admin'))}
                        disabled={busy === p.id}
                        className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:border-orange hover:text-orange disabled:opacity-60"
                        title={p.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                      >
                        {p.role === 'admin' ? <User size={13} /> : <Shield size={13} />}
                        {p.role === 'admin' ? 'Remover admin' : 'Tornar admin'}
                      </button>
                    </div>
                  )}
                  {isMe && <span className="text-xs text-ink-muted">(você)</span>}
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-2 border-t border-line/60 pt-2 text-xs">
                  <span className="flex items-center gap-1 text-ink-muted"><Smartphone size={12} /> 2FA SeaTalk:</span>
                  <button
                    onClick={() => toggle2FA(p)}
                    disabled={busy === p.id}
                    className={`rounded-md px-2 py-0.5 font-semibold disabled:opacity-60 ${
                      p.two_factor_enabled
                        ? 'bg-success/15 text-success hover:bg-success/25'
                        : 'border border-line text-ink-secondary hover:border-orange hover:text-orange'
                    }`}
                  >
                    {p.two_factor_enabled ? 'Ativado' : 'Desativado'}
                  </button>
                  {p.two_factor_enabled && (
                    <button
                      onClick={() => editSeatalkCode(p)}
                      disabled={busy === p.id}
                      className="rounded-md border border-line px-2 py-0.5 font-medium text-ink-secondary hover:border-orange hover:text-orange disabled:opacity-60"
                    >
                      Código: {p.seatalk_code || '— definir'}
                    </button>
                  )}
                </div>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}
