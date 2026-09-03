import { useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { ShieldCheck, Loader2, CheckCircle2, AlertTriangle } from 'lucide-react'

const FN_URL =
  (import.meta.env.VITE_SUPABASE_URL ?? 'https://pjhzbefheinbjcdywuma.supabase.co') +
  '/functions/v1/seatalk-2fa'

type Phase = 'idle' | 'loading' | 'approved' | 'expired' | 'invalid' | 'error'

/**
 * Página pública aberta pelo link do SeaTalk. Confirma (com um toque no botão)
 * a aprovação do login 2FA — a UI fica aqui no portal porque a Edge Function
 * não pode servir HTML renderizado.
 */
export default function ApproveLogin() {
  const [params] = useSearchParams()
  const token = params.get('token') ?? ''
  const [phase, setPhase] = useState<Phase>('idle')

  async function approve() {
    if (!token) {
      setPhase('invalid')
      return
    }
    setPhase('loading')
    try {
      const r = await fetch(`${FN_URL}?token=${encodeURIComponent(token)}`, { method: 'POST' })
      const data = await r.json().catch(() => ({}))
      const s = data?.status
      if (s === 'approved' || s === 'already') setPhase('approved')
      else if (s === 'expired') setPhase('expired')
      else if (s === 'invalid') setPhase('invalid')
      else setPhase('error')
    } catch {
      setPhase('error')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <span
        className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${
          phase === 'approved'
            ? 'bg-green-50 text-success'
            : phase === 'expired' || phase === 'invalid' || phase === 'error'
              ? 'bg-red-50 text-danger'
              : 'bg-orange-light text-orange'
        }`}
      >
        {phase === 'approved' ? (
          <CheckCircle2 size={30} />
        ) : phase === 'expired' || phase === 'invalid' || phase === 'error' ? (
          <AlertTriangle size={30} />
        ) : (
          <ShieldCheck size={30} />
        )}
      </span>

      {phase === 'idle' && (
        <>
          <h1 className="text-xl font-bold text-ink">Aprovar acesso</h1>
          <p className="mt-2 max-w-md text-sm text-ink-secondary">
            Confirme que <strong>foi você</strong> quem está entrando no portal Jornada Reversa agora.
          </p>
          <button onClick={approve} className="btn-primary mt-6 w-fit">
            <ShieldCheck size={16} /> Aprovar acesso
          </button>
          <p className="mt-4 max-w-xs text-xs text-ink-muted">
            Se não foi você, apenas feche esta página e troque sua senha.
          </p>
        </>
      )}

      {phase === 'loading' && (
        <>
          <h1 className="text-xl font-bold text-ink">Aprovando…</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-secondary">
            <Loader2 size={15} className="animate-spin" /> Um instante.
          </p>
        </>
      )}

      {phase === 'approved' && (
        <>
          <h1 className="text-xl font-bold text-ink">Acesso liberado! ✅</h1>
          <p className="mt-2 max-w-md text-sm text-ink-secondary">
            Pode voltar ao portal Jornada Reversa — ele vai abrir automaticamente.
          </p>
        </>
      )}

      {phase === 'expired' && (
        <>
          <h1 className="text-xl font-bold text-ink">Pedido expirado</h1>
          <p className="mt-2 max-w-md text-sm text-ink-secondary">
            Passou do tempo de 2 minutos. Volte ao portal e tente entrar novamente.
          </p>
        </>
      )}

      {(phase === 'invalid' || phase === 'error') && (
        <>
          <h1 className="text-xl font-bold text-ink">Não foi possível aprovar</h1>
          <p className="mt-2 max-w-md text-sm text-ink-secondary">
            {phase === 'invalid'
              ? 'Este link não é válido. Volte ao portal e tente entrar novamente.'
              : 'Algo deu errado. Tente novamente pelo portal.'}
          </p>
        </>
      )}
    </div>
  )
}
