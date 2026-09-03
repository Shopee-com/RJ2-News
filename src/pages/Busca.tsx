import { useMemo, useState, useEffect } from 'react'
import { useSearchParams, Link, useNavigate } from 'react-router-dom'
import { Search, ArrowRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import FilterTabs from '@/components/ui/FilterTabs'
import EmptyState from '@/components/ui/EmptyState'
import { loadSearchIndex, filterResults, groupResults, SEARCH_GROUPS, type SearchGroup, type SearchResult } from '@/lib/search'

const FILTERS = ['Todos', ...SEARCH_GROUPS]

export default function Busca() {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const initial = params.get('q') ?? ''
  const [query, setQuery] = useState(initial)
  const [group, setGroup] = useState<string>('Todos')
  const [index, setIndex] = useState<SearchResult[]>([])

  useEffect(() => {
    loadSearchIndex().then(setIndex).catch(() => setIndex([]))
  }, [])

  useEffect(() => {
    setQuery(params.get('q') ?? '')
  }, [params])

  const results = useMemo(() => filterResults(index, query, group as SearchGroup | 'Todos'), [index, query, group])
  const grouped = useMemo(() => groupResults(results), [results])

  return (
    <>
      <PageHeader
        eyebrow="Busca Global"
        title="Buscar no portal"
        subtitle="Encontre POPs, notícias, dashboards, ferramentas, pessoas, etapas e vagas."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Busca' }]}
      />

      <div className="portal-container py-6">
        <div className="relative mb-4">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-ink-muted" />
          <input
            value={query}
            autoFocus
            onChange={(e) => {
              setQuery(e.target.value)
              setParams(e.target.value ? { q: e.target.value } : {})
            }}
            placeholder="Buscar POP, notícia, dashboard, ferramenta ou pessoa..."
            className="h-12 w-full rounded-lg border border-line bg-white pl-11 pr-3 text-sm outline-none placeholder:text-ink-muted focus:border-orange"
          />
        </div>

        <div className="mb-6">
          <FilterTabs options={FILTERS} value={group} onChange={setGroup} />
        </div>

        {!query.trim() ? (
          <p className="py-12 text-center text-sm text-ink-muted">Digite algo para começar a busca.</p>
        ) : results.length === 0 ? (
          <EmptyState message={`Nenhum resultado para “${query}”.`} />
        ) : (
          <div className="space-y-8">
            <p className="text-sm text-ink-muted">
              {results.length} resultado{results.length > 1 ? 's' : ''} para “{query}”
            </p>
            {Object.entries(grouped).map(([g, items]) => (
              <div key={g}>
                <h2 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">{g}</h2>
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                  {items.map((r, i) => (
                    <button
                      key={i}
                      onClick={() => navigate(r.to)}
                      className="card flex items-center justify-between gap-3 p-4 text-left transition-shadow hover:shadow-card-hover"
                    >
                      <span className="min-w-0">
                        <span className="block truncate text-sm font-semibold text-ink">{r.title}</span>
                        <span className="block truncate text-xs text-ink-muted">{r.subtitle}</span>
                      </span>
                      <ArrowRight size={15} className="shrink-0 text-orange" />
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-8 text-center">
          <Link to="/" className="link-arrow justify-center">← Voltar para o início</Link>
        </div>
      </div>
    </>
  )
}
