import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import FilterTabs from '@/components/ui/FilterTabs'
import PopCard from '@/components/ui/PopCard'
import EmptyState from '@/components/ui/EmptyState'
import Loading, { ErrorBox } from '@/components/ui/Loading'
import { POP_CATEGORIES } from '@/data/pops'
import { getPops } from '@/data/content'
import { useAsync } from '@/lib/useAsync'

export default function Pop() {
  const [category, setCategory] = useState<string>('Todos')
  const [query, setQuery] = useState('')
  const { data: pops, loading, error } = useAsync(getPops, [])

  // Mostra apenas as categorias que têm POP publicado (mantendo a ordem oficial)
  const categories = useMemo(() => {
    const present = new Set((pops ?? []).map((p) => p.category))
    return POP_CATEGORIES.filter((c) => c === 'Todos' || present.has(c))
  }, [pops])

  const filtered = useMemo(() => {
    const list = pops ?? []
    const q = query.trim().toLowerCase()
    return list.filter((p) => {
      const byCat = category === 'Todos' || p.category === category
      const byQuery =
        !q || p.name.toLowerCase().includes(q) || p.code.toLowerCase().includes(q) || p.summary.toLowerCase().includes(q)
      return byCat && byQuery
    })
  }, [pops, category, query])

  return (
    <>
      <PageHeader
        eyebrow="Central de Procedimentos"
        title="POP"
        subtitle="Central de Procedimentos Operacionais da Logística Reversa."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'POP' }]}
      />
      <div className="portal-container py-6">
        <div className="mb-4 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar procedimento..."
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none placeholder:text-ink-muted focus:border-orange"
            />
          </div>
          <FilterTabs options={categories} value={category} onChange={setCategory} />
        </div>

        {loading ? (
          <Loading label="Carregando procedimentos..." />
        ) : error ? (
          <ErrorBox message={error} />
        ) : filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((p) => (
              <PopCard key={p.id} pop={p} />
            ))}
          </div>
        ) : (
          <EmptyState message="Nenhum procedimento encontrado." />
        )}
      </div>
    </>
  )
}
