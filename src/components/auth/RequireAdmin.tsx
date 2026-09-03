import type { ReactNode } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import { Loader2, ShieldAlert } from 'lucide-react'
import { useAuth } from '@/lib/auth'

export default function RequireAdmin({ children }: { children: ReactNode }) {
  const { loading, session, isAdmin } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="flex min-h-[70vh] items-center justify-center">
        <Loader2 className="animate-spin text-orange" size={28} />
      </div>
    )
  }

  if (!session) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />
  }

  if (!isAdmin) {
    return (
      <div className="portal-container flex min-h-[60vh] flex-col items-center justify-center py-16 text-center">
        <ShieldAlert size={40} className="mb-3 text-warn" />
        <h1 className="text-xl font-bold text-ink">Acesso restrito</h1>
        <p className="mt-2 max-w-md text-sm text-ink-secondary">
          Sua conta não tem permissão de administrador. Fale com o time de Reversa se precisar de acesso.
        </p>
      </div>
    )
  }

  return <>{children}</>
}
