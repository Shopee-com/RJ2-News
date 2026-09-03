import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import FilterTabs from '@/components/ui/FilterTabs'
import NewsCard from '@/components/ui/NewsCard'
import EmptyState from '@/components/ui/EmptyState'
import Loading, { ErrorBox } from '@/components/ui/Loading'
import { NEWS_CATEGORIES } from '@/data/news'
import { getNews } from '@/data/content'
import { useAsync } from '@/lib/useAsync'
import { formatDateLong } from '@/lib/format'

const PAGE_SIZE = 6

export default function Novidades() {
  const [category, setCategory] = useState('Todos')
  const [page, setPage] = useState(1)
  const { data: news, loading, error } = useAsync(getNews, [])

  const latestNews = useMemo(
    () => [...(news ?? [])].sort((a, b) => b.date.localeCompare(a.date)),
    [news],
  )
  const hero = latestNews.find((n) => n.featured) ?? latestNews[0]

  const filtered = useMemo(() => {
    if (!hero) return []
    const list = latestNews.filter((n) => n.id !== hero.id)
    return category === 'Todos' ? list : list.filter((n) => n.category === category)
  }, [latestNews, category, hero])

  const pageCount = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE))
  const shown = filtered.slice(0, page * PAGE_SIZE)

  if (loading)
    return (
      <>
        <PageHeader eyebrow="Jornal Reversa" title="Novidades" crumbs={[{ label: 'Início', to: '/' }, { label: 'Novidades' }]} />
        <div className="portal-container"><Loading label="Carregando novidades..." /></div>
      </>
    )
  if (error)
    return (
      <>
        <PageHeader eyebrow="Jornal Reversa" title="Novidades" crumbs={[{ label: 'Início', to: '/' }, { label: 'Novidades' }]} />
        <div className="portal-container py-6"><ErrorBox message={error} /></div>
      </>
    )
  if (!hero)
    return (
      <>
        <PageHeader eyebrow="Jornal Reversa" title="Novidades" crumbs={[{ label: 'Início', to: '/' }, { label: 'Novidades' }]} />
        <div className="portal-container py-6"><EmptyState message="Nenhuma notícia publicada ainda." /></div>
      </>
    )

  return (
    <>
      <PageHeader
        eyebrow="Jornal Reversa"
        title="Novidades"
        subtitle="Tudo o que acontece na operação reversa: operação, processos, performance e pessoas."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Novidades' }]}
      />

      <div className="portal-container py-6">
        {/* Featured */}
        <Link
          to={`/novidades/${hero.slug}`}
          className="group relative mb-6 block h-[300px] overflow-hidden rounded-card sm:h-[380px]"
        >
          <img src={hero.image} alt={hero.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.03]" />
          <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/40 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-6 sm:p-8">
            <div className="mb-2 flex items-center gap-2">
              <span className="label-chip rounded bg-orange px-2 py-1 text-white">{hero.category}</span>
              <span className="text-xs text-on-dark-secondary">{formatDateLong(hero.date)}</span>
            </div>
            <h2 className="max-w-2xl text-2xl font-extrabold text-white sm:text-3xl">{hero.title}</h2>
            <p className="mt-2 max-w-xl text-sm text-on-dark-secondary">{hero.excerpt}</p>
            <span className="mt-4 inline-flex items-center gap-1 text-sm font-semibold text-orange">
              Ler matéria completa <ArrowRight size={14} />
            </span>
          </div>
        </Link>

        {/* Filters */}
        <div className="mb-4">
          <FilterTabs
            options={NEWS_CATEGORIES}
            value={category}
            onChange={(v) => {
              setCategory(v)
              setPage(1)
            }}
          />
        </div>

        {shown.length ? (
          <>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {shown.map((article) => (
                <NewsCard key={article.id} article={article} showViews />
              ))}
            </div>
            {page < pageCount && (
              <div className="mt-6 flex justify-center">
                <button onClick={() => setPage((p) => p + 1)} className="btn-ghost">
                  Carregar mais
                </button>
              </div>
            )}
          </>
        ) : (
          <EmptyState message="Nenhuma matéria nesta categoria." />
        )}
      </div>
    </>
  )
}
