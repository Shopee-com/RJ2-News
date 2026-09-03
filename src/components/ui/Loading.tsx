import { Loader2 } from 'lucide-react'

export default function Loading({ label = 'Carregando...' }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-20 text-ink-muted">
      <Loader2 size={28} className="animate-spin text-orange" />
      <p className="text-sm">{label}</p>
    </div>
  )
}

export function ErrorBox({ message }: { message: string }) {
  return (
    <div className="rounded-card border border-line bg-white p-6 text-center">
      <p className="text-sm font-medium text-danger">Não foi possível carregar o conteúdo.</p>
      <p className="mt-1 text-xs text-ink-muted">{message}</p>
    </div>
  )
}
