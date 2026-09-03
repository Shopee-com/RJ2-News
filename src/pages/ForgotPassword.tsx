import { useState } from 'react'
import { Link } from 'react-router-dom'
import { KeyRound, Loader2, MessageCircle, ArrowLeft, User } from 'lucide-react'

const FN_URL =
  (import.meta.env.VITE_SUPABASE_URL ?? 'https://pjhzbefheinbjcdywuma.supabase.co') +
  '/functions/v1/seatalk-2fa'

export default function ForgotPassword() {
  const [identifier, setIdentifier] = useState('')
  const [phase, setPhase] = useState<'idle' | 'loading' | 'sent'>('idle')

  async function submit(e: React.FormEvent) {
    e.preventDefault()
    setPhase('loading')
    try {
      await fetch(`${FN_URL}?reset=request`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ identifier }),
      })
    } catch {
      /* resposta é neutra de qualquer forma */
    }
    setPhase('sent')
  }

  return (
    <div className="flex min-h-[85vh] items-center justify-center px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-xl bg-orange-light text-orange">
            <KeyRound size={26} />
          </span>
          <h1 className="text-xl font-extrabold text-ink">Esqueci a senha</h1>
          <p className="mt-1 text-sm text-ink-secondary">Redefina pelo seu SeaTalk</p>
        </div>

        {phase === 'sent' ? (
          <div className="card p-6 text-center">
            <span className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-orange-light text-orange">
              <MessageCircle size={22} />
            </span>
            <h2 className="text-base font-bold text-ink">Verifique seu SeaTalk</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Se a conta existir e estiver com o SeaTalk configurado, enviamos um link para redefinir a
              senha (válido por 15 minutos). Abra o bot <strong>Jornada Reversa</strong> e toque no link.
            </p>
            <Link to="/login" className="btn-ghost mt-5 w-full">
              <ArrowLeft size={15} /> Voltar ao login
            </Link>
          </div>
        ) : (
          <form onSubmit={submit} className="card space-y-4 p-6">
            <p className="text-sm text-ink-secondary">
              Informe seu e-mail ou OpsID. Enviaremos um link de redefinição no seu SeaTalk.
            </p>
            <div>
              <label className="mb-1 block text-xs font-semibold text-ink-secondary">E-mail ou OpsID</label>
              <div className="relative">
                <User size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
                <input
                  required
                  value={identifier}
                  onChange={(e) => setIdentifier(e.target.value)}
                  placeholder="e-mail@shopee.com ou seu OpsID"
                  className="h-11 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none focus:border-orange"
                />
              </div>
            </div>
            <button type="submit" disabled={phase === 'loading'} className="btn-primary w-full disabled:opacity-60">
              {phase === 'loading' ? <Loader2 size={16} className="animate-spin" /> : <KeyRound size={16} />}
              Enviar link no SeaTalk
            </button>
            <p className="text-center text-xs text-ink-muted">
              <Link to="/login" className="font-semibold text-orange hover:text-orange-hover">Voltar ao login</Link>
            </p>
          </form>
        )}
      </div>
    </div>
  )
}
