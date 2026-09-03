import { SearchX } from 'lucide-react'

export default function EmptyState({ message = 'Nenhum resultado encontrado.' }: { message?: string }) {
  return (
    <div className="flex flex-col items-center justify-center rounded-card border border-dashed border-line bg-white py-16 text-center">
      <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-bg-secondary text-ink-muted">
        <SearchX size={22} />
      </div>
      <p className="text-sm font-medium text-ink-secondary">{message}</p>
      <p className="mt-1 text-xs text-ink-muted">Tente ajustar os filtros ou a busca.</p>
    </div>
  )
}
