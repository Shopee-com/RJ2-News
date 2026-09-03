import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, X, ArrowRight } from 'lucide-react'
import { useUI } from './UIContext'
import { loadSearchIndex, filterResults, groupResults, type SearchResult } from '@/lib/search'

export default function SearchModal() {
  const { searchOpen, closeSearch } = useUI()
  const [query, setQuery] = useState('')
  const [index, setIndex] = useState<SearchResult[]>([])
  const navigate = useNavigate()

  useEffect(() => {
    if (searchOpen) loadSearchIndex().then(setIndex).catch(() => setIndex([]))
  }, [searchOpen])

  const results = useMemo(() => filterResults(index, query), [index, query])
  const grouped = useMemo(() => groupResults(results), [results])

  useEffect(() => {
    if (searchOpen) setQuery('')
  }, [searchOpen])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeSearch()
    }
    if (searchOpen) {
      document.addEventListener('keydown', onKey)
      document.body.style.overflow = 'hidden'
    }
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [searchOpen, closeSearch])

  if (!searchOpen) return null

  function go(to: string) {
    closeSearch()
    navigate(to)
  }

  return (
    <div
      className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-4 pt-[8vh] backdrop-blur-sm"
      onClick={closeSearch}
      role="dialog"
      aria-modal="true"
      aria-label="Busca global"
    >
      <div
        className="w-full max-w-2xl overflow-hidden rounded-card border border-line bg-white shadow-panel animate-fade-in"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 border-b border-line px-4">
          <Search size={18} className="text-ink-muted" />
          <input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && query.trim()) {
                go(`/busca?q=${encodeURIComponent(query)}`)
              }
            }}
            placeholder="Buscar POP, notícia, dashboard, ferramenta ou pessoa..."
            className="h-14 flex-1 bg-transparent text-sm outline-none placeholder:text-ink-muted"
          />
          <button onClick={closeSearch} aria-label="Fechar busca" className="text-ink-muted hover:text-ink">
            <X size={18} />
          </button>
        </div>

        <div className="max-h-[55vh] overflow-y-auto">
          {!query.trim() && (
            <p className="px-4 py-8 text-center text-sm text-ink-muted">
              Digite para buscar em todo o portal.
            </p>
          )}
          {query.trim() && results.length === 0 && (
            <p className="px-4 py-8 text-center text-sm text-ink-muted">
              Nenhum resultado para “{query}”.
            </p>
          )}
          {Object.entries(grouped).map(([group, items]) => (
            <div key={group} className="border-b border-line last:border-0">
              <div className="bg-bg-secondary px-4 py-1.5 text-label font-bold uppercase tracking-wide text-ink-muted">
                {group}
              </div>
              {items.slice(0, 5).map((r, i) => (
                <button
                  key={i}
                  onClick={() => go(r.to)}
                  className="flex w-full items-center justify-between gap-3 px-4 py-2.5 text-left hover:bg-orange-light"
                >
                  <span className="min-w-0">
                    <span className="block truncate text-sm font-semibold text-ink">{r.title}</span>
                    <span className="block truncate text-xs text-ink-muted">{r.subtitle}</span>
                  </span>
                  <ArrowRight size={14} className="shrink-0 text-orange" />
                </button>
              ))}
            </div>
          ))}
        </div>

        {query.trim() && results.length > 0 && (
          <button
            onClick={() => go(`/busca?q=${encodeURIComponent(query)}`)}
            className="flex w-full items-center justify-center gap-2 border-t border-line bg-white py-3 text-sm font-semibold text-orange hover:bg-orange-light"
          >
            Ver todos os resultados <ArrowRight size={14} />
          </button>
        )}
      </div>
    </div>
  )
}
