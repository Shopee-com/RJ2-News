import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { UserPlus, Loader2, Newspaper, CheckCircle2, Mail, IdCard } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import { fetchOperations, fetchLocalities } from '@/data/access'
import { useAsync } from '@/lib/useAsync'

const FN_URL =
  (import.meta.env.VITE_SUPABASE_URL ?? 'https://pjhzbefheinbjcdywuma.supabase.co') +
  '/functions/v1/seatalk-2fa'

export default function Signup() {
  const { signUp } = useAuth()
  const { data: operations } = useAsync(fetchOperations, [])
  const { data: localities } = useAsync(fetchLocalities, [])

  const [name, setName] = useState('')
  const [operation, setOperation] = useState('')
  const [locality, setLocality] = useState('')
  const [mode, setMode] = useState<'email' | 'opsid'>('email')
  const [email, setEmail] = useState('')
  const [opsid, setOpsid] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [done, setDone] = useState(false)
  const [autoApproved, setAutoApproved] = useState(false)

  const localityOptions = useMemo(
    () => (localities ?? []).filter((l) => !operation || l.operation === operation),
    [localities, operation],
  )

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (!name.trim()) return setError('Informe seu nome.')
    if (!operation) return setError('Selecione a operação.')
    if (!locality) return setError('Selecione a localidade.')
    if (mode === 'email' && !email.trim()) return setError('Informe seu e-mail.')
    if (mode === 'opsid' && !opsid.trim()) return setError('Informe seu OpsID.')
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.')

    setSubmitting(true)
    const { error } = await signUp({
      name,
      operation,
      locality,
      password,
      email: mode === 'email' ? email : undefined,
      opsid: mode === 'opsid' ? opsid : undefined,
    })
    if (error) {
      setSubmitting(false)
      setError(error)
      return
    }
    // Está no subteam? Auto-aprova na hora (e-mail corporativo alcançável no SeaTalk).
    if (mode === 'email' && email.trim()) {
      try {
        const r = await fetch(`${FN_URL}?enroll=1`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: email.trim().toLowerCase() }),
        })
        const d = await r.json().catch(() => ({}))
        setAutoApproved(!!d?.approved)
      } catch { /* fica pendente para o admin */ }
    }
    setSubmitting(false)
    setDone(true)
  }

  if (done) {
    return (
      <div className="flex min-h-[80vh] items-center justify-center px-4 py-10">
        <div className="card w-full max-w-sm p-8 text-center">
          <CheckCircle2 size={40} className="mx-auto mb-3 text-success" />
          {autoApproved ? (
            <>
              <h1 className="text-lg font-bold text-ink">Acesso liberado! 🎉</h1>
              <p className="mt-2 text-sm text-ink-secondary">
                Sua conta foi <strong>aprovada automaticamente</strong> (você está no time autorizado).
                Já pode entrar — no login, aprove pelo <strong>SeaTalk</strong>.
              </p>
            </>
          ) : (
            <>
              <h1 className="text-lg font-bold text-ink">Cadastro enviado!</h1>
              <p className="mt-2 text-sm text-ink-secondary">
                Seu acesso está <strong>aguardando aprovação</strong> de um administrador. Você poderá
                entrar assim que for aprovado.
              </p>
            </>
          )}
          <Link to="/login" className="btn-primary mt-5 w-full">Ir para o login</Link>
        </div>
      </div>
    )
  }

  const inputCls = 'h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-orange'

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-dark text-orange">
            <Newspaper size={26} />
          </span>
          <h1 className="text-xl font-extrabold">
            <span className="text-dark">JORNAL</span> <span className="text-orange">REVERSA</span>
          </h1>
          <p className="mt-1 text-sm text-ink-secondary">Solicite seu acesso ao portal</p>
        </div>

        <form onSubmit={onSubmit} className="card space-y-4 p-6">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-secondary">Nome completo</span>
            <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
          </label>

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Operação</span>
              <select
                className={inputCls}
                value={operation}
                onChange={(e) => { setOperation(e.target.value); setLocality('') }}
              >
                <option value="">Selecione...</option>
                {(operations ?? []).map((o) => (
                  <option key={o.id} value={o.name}>{o.name}</option>
                ))}
              </select>
            </label>
            <label className="block">
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Localidade</span>
              <select className={inputCls} value={locality} onChange={(e) => setLocality(e.target.value)} disabled={!operation}>
                <option value="">Selecione...</option>
                {localityOptions.map((l) => (
                  <option key={l.id} value={l.name}>{l.name}</option>
                ))}
              </select>
            </label>
          </div>

          {/* Alternância e-mail / OpsID */}
          <div>
            <div className="mb-2 flex rounded-lg border border-line p-1">
              <button
                type="button"
                onClick={() => setMode('email')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors ${mode === 'email' ? 'bg-orange text-white' : 'text-ink-secondary'}`}
              >
                <Mail size={14} /> Tenho e-mail
              </button>
              <button
                type="button"
                onClick={() => setMode('opsid')}
                className={`flex flex-1 items-center justify-center gap-1.5 rounded-md py-1.5 text-xs font-semibold transition-colors ${mode === 'opsid' ? 'bg-orange text-white' : 'text-ink-secondary'}`}
              >
                <IdCard size={14} /> Usar OpsID
              </button>
            </div>
            {mode === 'email' ? (
              <input className={inputCls} type="email" placeholder="seu.email@shopee.com" value={email} onChange={(e) => setEmail(e.target.value)} />
            ) : (
              <input className={inputCls} placeholder="Seu OpsID operacional" value={opsid} onChange={(e) => setOpsid(e.target.value)} />
            )}
          </div>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-ink-secondary">Senha</span>
            <input className={inputCls} type="password" placeholder="Mínimo 6 caracteres" value={password} onChange={(e) => setPassword(e.target.value)} />
          </label>

          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-danger">{error}</p>}

          <button type="submit" disabled={submitting} className="btn-primary w-full disabled:opacity-60">
            {submitting ? <Loader2 size={16} className="animate-spin" /> : <UserPlus size={16} />}
            Solicitar acesso
          </button>

          <p className="text-center text-xs text-ink-muted">
            Já tem acesso?{' '}
            <Link to="/login" className="font-semibold text-orange hover:text-orange-hover">Entrar</Link>
          </p>
        </form>
      </div>
    </div>
  )
}
