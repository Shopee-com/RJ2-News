import { useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { KeyRound, Loader2, Lock, CheckCircle2, AlertTriangle } from 'lucide-react'

const FN_URL =
  (import.meta.env.VITE_SUPABASE_URL ?? 'https://pjhzbefheinbjcdywuma.supabase.co') +
  '/functions/v1/seatalk-2fa'

type Phase = 'idle' | 'loading' | 'done' | 'expired' | 'invalid' | 'error'

export default function ResetPassword() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [phase, setPhase] = useState<Phase>('idle')
  const [msg, setMsg] = useState('')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setMsg('')
    if (pw.length < 6) { setMsg('A senha precisa ter pelo menos 6 caracteres.'); return }
    if (pw !== pw2) { setMsg('As senhas não são iguais.'); return }
    setPhase('loading')
    try {
      const r = await fetch(`${FN_URL}?reset=confirm`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token, password: pw }),
      })
      const data = await r.json().catch(() => ({}))
      const s = data?.status
      if (s === 'done') setPhase('done')
      else if (s === 'expired') setPhase('expired')
      else if (s === 'invalid') setPhase('invalid')
      else if (s === 'weak') { setPhase('idle'); setMsg('A senha precisa ter pelo menos 6 caracteres.') }
      else setPhase('error')
    } catch {
      setPhase('error')
    }
  }

  const inputCls = 'h-11 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-orange'

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span
            className={`mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl ${
              phase === 'done' ? 'bg-green-50 text-success' : phase === 'expired' || phase === 'invalid' || phase === 'error' ? 'bg-red-50 text-danger' : 'bg-orange-light text-orange'
            }`}
          >
            {phase === 'done' ? <CheckCircle2 size={26} /> : phase === 'expired' || phase === 'invalid' || phase === 'error' ? <AlertTriangle size={26} /> : <KeyRound size={26} />}
          </span>
          <h1 className="text-xl font-extrabold text-ink">Redefinir senha</h1>
        </div>

        {phase === 'done' ? (
          <div className="card p-6 text-center">
            <h2 className="text-base font-bold text-ink">Senha alterada! ✅</h2>
            <p className="mt-2 text-sm text-ink-secondary">Já pode entrar com a nova senha.</p>
            <Link to="/login" className="btn-primary mx-auto mt-5 w-fit">Ir para o login</Link>
          </div>
        ) : phase === 'expired' || phase === 'invalid' ? (
          <div className="card p-6 text-center">
            <h2 className="text-base font-bold text-ink">
              {phase === 'expired' ? 'Link expirado' : 'Link inválido'}
            </h2>
            <p className="mt-2 text-sm text-ink-secondary">
              {phase === 'expired'
                ? 'Este link passou dos 15 minutos. Peça um novo em "Esqueci a senha".'
                : 'Este link não é válido ou já foi usado. Peça um novo em "Esqueci a senha".'}
            </p>
            <Link to="/esqueci" className="btn-primary mx-auto mt-5 w-fit">Pedir novo link</Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-4 p-6">
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-secondary">Nova senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input type="password" required value={pw} onChange={(e) => setPw(e.target.value)} placeholder="••••••••" className={inputCls} />
              </div>
            </div>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-secondary">Repita a nova senha</label>
              <div className="relative">
                <Lock size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input type="password" required value={pw2} onChange={(e) => setPw2(e.target.value)} placeholder="••••••••" className={inputCls} />
              </div>
            </div>
            {msg && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-danger">{msg}</p>}
            {phase === 'error' && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-danger">Algo deu errado. Tente novamente.</p>}
            <button type="submit" disabled={phase === 'loading' || !token} className="btn-primary w-full disabled:opacity-60">
              {phase === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              Salvar nova senha
            </button>
          </form>
        )}
      </div>
    </div>
  )
}
