import { useEffect, useRef, useState } from 'react'
import { Loader2, ShieldCheck, LogOut, RefreshCw, AlertTriangle } from 'lucide-react'
import { useAuth } from '@/lib/auth'

type Phase = 'sending' | 'waiting' | 'expired' | 'error'

/**
 * Portão de 2FA por SeaTalk: dispara a solicitação de aprovação e aguarda o
 * usuário aprovar no bot (em até 2 min). Enquanto isso faz polling do perfil;
 * assim que a aprovação libera (is_approved no banco), o RequireAccess destrava.
 */
export default function SeaTalk2FAGate() {
  const { request2FA, refreshProfile, signOut, profile } = useAuth()
  const [phase, setPhase] = useState<Phase>('sending')
  const [msg, setMsg] = useState<string>('')
  const [left, setLeft] = useState<number>(120)
  const started = useRef(false)
  const timers = useRef<number[]>([])

  function clearTimers() {
    timers.current.forEach((t) => clearInterval(t))
    timers.current = []
  }

  async function start() {
    clearTimers()
    setPhase('sending')
    setMsg('')
    const res = await request2FA()
    if (res.error) {
      setPhase('error')
      setMsg(
        res.error === 'sem_seatalk_code'
          ? 'Sua conta ainda não tem o código do SeaTalk cadastrado. Peça a um administrador para configurar.'
          : res.error === 'falha_envio_seatalk'
            ? 'Não foi possível enviar a mensagem no SeaTalk. Verifique a configuração do bot e tente de novo.'
            : `Falha ao solicitar aprovação: ${res.error}`,
      )
      return
    }
    // aprovação enviada — começa a contagem e o polling
    setPhase('waiting')
    setLeft(120)
    const countdown = window.setInterval(() => {
      setLeft((s) => {
        if (s <= 1) {
          clearTimers()
          setPhase('expired')
          return 0
        }
        return s - 1
      })
    }, 1000)
    const poll = window.setInterval(() => {
      refreshProfile()
    }, 3000)
    timers.current.push(countdown, poll)
  }

  useEffect(() => {
    if (started.current) return
    started.current = true
    start()
    return clearTimers
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const mm = String(Math.floor(left / 60)).padStart(1, '0')
  const ss = String(left % 60).padStart(2, '0')

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
      <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-light text-orange">
        {phase === 'error' ? <AlertTriangle size={30} /> : <ShieldCheck size={30} />}
      </span>

      {phase === 'sending' && (
        <>
          <h1 className="text-xl font-bold text-ink">Enviando aprovação…</h1>
          <p className="mt-2 flex items-center gap-2 text-sm text-ink-secondary">
            <Loader2 size={15} className="animate-spin" /> Preparando a solicitação no SeaTalk.
          </p>
        </>
      )}

      {phase === 'waiting' && (
        <>
          <h1 className="text-xl font-bold text-ink">Aprove o acesso no SeaTalk</h1>
          <p className="mt-2 max-w-md text-sm text-ink-secondary">
            Enviamos uma mensagem no seu SeaTalk. Toque em <strong>“Aprovar acesso”</strong> para
            liberar o login. Esta tela abre sozinha assim que você aprovar.
          </p>
          <div className="mt-5 flex items-center gap-2 rounded-lg border border-line bg-white px-4 py-2 text-sm font-semibold text-ink">
            <Loader2 size={15} className="animate-spin text-orange" /> Aguardando… {mm}:{ss}
          </div>
        </>
      )}

      {phase === 'expired' && (
        <>
          <h1 className="text-xl font-bold text-ink">Tempo esgotado</h1>
          <p className="mt-2 max-w-md text-sm text-ink-secondary">
            A aprovação não foi confirmada em 2 minutos. Você pode enviar uma nova solicitação.
          </p>
        </>
      )}

      {phase === 'error' && (
        <>
          <h1 className="text-xl font-bold text-ink">Não foi possível verificar</h1>
          <p className="mt-2 max-w-md text-sm text-ink-secondary">{msg}</p>
        </>
      )}

      {profile && (
        <div className="mt-4 rounded-lg border border-line bg-white px-4 py-2 text-xs text-ink-muted">
          {profile.name} · {profile.operation} · {profile.locality}
        </div>
      )}

      <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
        {(phase === 'expired' || phase === 'error') && (
          <button onClick={start} className="btn-primary">
            <RefreshCw size={15} /> Tentar de novo
          </button>
        )}
        <button onClick={signOut} className="btn-ghost">
          <LogOut size={15} /> Sair
        </button>
      </div>
    </div>
  )
}
