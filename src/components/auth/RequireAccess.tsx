import { Navigate, useLocation } from 'react-router-dom'
import { Loader2, Clock, LogOut, Lock } from 'lucide-react'
import { useAuth } from '@/lib/auth'
import SeaTalk2FAGate from './SeaTalk2FAGate'

/**
 * Fecha o portal inteiro: sem login não vê nada; logado mas sem aprovação
 * vê apenas a tela de "aguardando aprovação".
 */
export default function RequireAccess({ children }: { children: React.ReactNode }) {
  const { loading, session, isApproved, isLocked, needs2FA, profile, signOut } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-bg">
        <Loader2 className="animate-spin text-orange" size={30} />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (isLocked) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
        <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-red-50 text-danger">
          <Lock size={30} />
        </span>
        <h1 className="text-xl font-bold text-ink">Conta bloqueada</h1>
        <p className="mt-2 max-w-md text-sm text-ink-secondary">
          Sua conta foi bloqueada após várias tentativas de acesso incorretas. Por segurança, o acesso
          ficará suspenso até que um administrador libere manualmente.
        </p>
        {profile && (
          <div className="mt-4 rounded-lg border border-line bg-white px-4 py-2 text-xs text-ink-muted">
            {profile.name} · {profile.operation} · {profile.locality}
          </div>
        )}
        <button onClick={signOut} className="btn-ghost mt-5">
          <LogOut size={15} /> Sair
        </button>
      </div>
    )
  }

  if (needs2FA) {
    return <SeaTalk2FAGate />
  }

  if (!isApproved) {
    const rejected = profile?.status === 'rejected'
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-bg px-4 text-center">
        <span className={`mb-4 flex h-16 w-16 items-center justify-center rounded-2xl ${rejected ? 'bg-red-50 text-danger' : 'bg-orange-light text-orange'}`}>
          <Clock size={30} />
        </span>
        <h1 className="text-xl font-bold text-ink">
          {rejected ? 'Acesso não aprovado' : 'Aguardando aprovação'}
        </h1>
        <p className="mt-2 max-w-md text-sm text-ink-secondary">
          {rejected
            ? 'Seu pedido de acesso não foi aprovado. Fale com o time de Reversa para mais informações.'
            : 'Seu cadastro foi recebido e está aguardando a aprovação de um administrador. Você receberá acesso assim que for liberado.'}
        </p>
        {profile && (
          <div className="mt-4 rounded-lg border border-line bg-white px-4 py-2 text-xs text-ink-muted">
            {profile.name} · {profile.operation} · {profile.locality}
          </div>
        )}
        <button onClick={signOut} className="btn-ghost mt-5">
          <LogOut size={15} /> Sair
        </button>
      </div>
    )
  }

  return <>{children}</>
}
