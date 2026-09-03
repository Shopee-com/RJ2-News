import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Clock, Eye, Share2, ArrowLeft } from 'lucide-react'
import Breadcrumb from '@/components/ui/Breadcrumb'
import Badge from '@/components/ui/Badge'
import NewsCard from '@/components/ui/NewsCard'
import EmptyState from '@/components/ui/EmptyState'
import SectionHeader from '@/components/ui/SectionHeader'
import Loading from '@/components/ui/Loading'
import { getNewsBySlug, getNews, incrementNewsViews } from '@/data/content'
import { useAsync } from '@/lib/useAsync'
import { formatDateLong, formatViews } from '@/lib/format'

export default function NewsDetail() {
  const { slug = '' } = useParams()
  const { data: article, loading } = useAsync(() => getNewsBySlug(slug), [slug])
  const { data: allNews } = useAsync(getNews, [])
  const [liveViews, setLiveViews] = useState<number | null>(null)

  // Conta a visualização uma vez por navegador (real)
  useEffect(() => {
    if (!slug) return
    const key = `spxr_viewed_${slug}`
    if (localStorage.getItem(key)) return
    localStorage.setItem(key, '1')
    incrementNewsViews(slug)
      .then((v) => setLiveViews(v))
      .catch(() => {})
  }, [slug])

  if (loading) return <Loading label="Carregando matéria..." />

  if (!article) {
    return (
      <div className="portal-container py-16">
        <EmptyState message="Matéria não encontrada." />
        <div className="mt-4 text-center">
          <Link to="/novidades" className="link-arrow justify-center">← Voltar para Novidades</Link>
        </div>
      </div>
    )
  }

  const related = (allNews ?? [])
    .filter((n) => n.category === article.category && n.id !== article.id)
    .slice(0, 3)

  return (
    <article>
      {/* Hero */}
      <div className="relative h-[300px] sm:h-[420px]">
        <img src={article.image} alt={article.title} className="h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-t from-dark/90 via-dark/50 to-dark/20" />
        <div className="portal-container absolute inset-x-0 bottom-0">
          <div className="pb-8">
            <Breadcrumb
              className="mb-3 [&_*]:text-on-dark-secondary"
              crumbs={[{ label: 'Início', to: '/' }, { label: 'Novidades', to: '/novidades' }, { label: article.category }]}
            />
            <div className="mb-3 flex items-center gap-2">
              <span className="label-chip rounded bg-orange px-2 py-1 text-white">{article.category}</span>
              <span className="text-xs text-on-dark-secondary">{formatDateLong(article.date)}</span>
            </div>
            <h1 className="max-w-3xl text-3xl font-extrabold leading-tight text-white sm:text-4xl">
              {article.title}
            </h1>
          </div>
        </div>
      </div>

      <div className="portal-container grid gap-8 py-8 lg:grid-cols-3">
        <div className="lg:col-span-2">
          {/* Meta */}
          <div className="mb-6 flex flex-wrap items-center gap-4 border-b border-line pb-4">
            <div>
              <p className="text-sm font-semibold text-ink">{article.author}</p>
              <p className="text-xs text-ink-muted">{article.authorRole}</p>
            </div>
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <Clock size={13} /> {article.readingMinutes} min de leitura
            </span>
            <span className="flex items-center gap-1 text-xs text-ink-muted">
              <Eye size={13} /> {formatViews(liveViews ?? article.views)} visualizações
            </span>
          </div>

          {/* Body */}
          <div className="space-y-4">
            <p className="text-lg font-medium leading-relaxed text-ink">{article.excerpt}</p>
            {article.content.map((p, i) => (
              <p key={i} className="leading-relaxed text-ink-secondary">
                {p}
              </p>
            ))}
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-line pt-6">
            <Link to="/novidades" className="btn-ghost">
              <ArrowLeft size={15} /> Voltar
            </Link>
            <button className="btn-primary">
              <Share2 size={15} /> Compartilhar
            </button>
          </div>
        </div>

        {/* Sidebar */}
        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Sobre a matéria</h3>
            <dl className="space-y-2 text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">Categoria</dt><dd><Badge>{article.category}</Badge></dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Publicado</dt><dd className="font-semibold text-ink">{formatDateLong(article.date)}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Autor</dt><dd className="font-semibold text-ink">{article.author}</dd></div>
            </dl>
          </div>
        </aside>
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="portal-container pb-10">
          <SectionHeader title="Matérias relacionadas" linkLabel="Ver todas" linkTo="/novidades" />
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {related.map((r) => (
              <NewsCard key={r.id} article={r} />
            ))}
          </div>
        </div>
      )}
    </article>
  )
}
