import { Link } from 'react-router-dom'
import { ArrowRight, Eye } from 'lucide-react'
import type { NewsArticle } from '@/types'
import { formatDateLong, formatViews } from '@/lib/format'

export default function NewsCard({ article, showViews = false }: { article: NewsArticle; showViews?: boolean }) {
  return (
    <article className="group card overflow-hidden transition-shadow duration-200 hover:shadow-card-hover">
      <Link to={`/novidades/${article.slug}`} className="block">
        <div className="aspect-[16/10] overflow-hidden bg-bg-secondary">
          <img
            src={article.image}
            alt={article.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
          />
        </div>
        <div className="p-4">
          <div className="mb-2 flex items-center gap-2">
            <span className="label-chip text-orange">{article.category}</span>
            <span className="text-xs text-ink-muted">{formatDateLong(article.date)}</span>
          </div>
          <h3 className="mb-1.5 line-clamp-2 text-base font-bold leading-snug text-ink group-hover:text-orange">
            {article.title}
          </h3>
          <p className="line-clamp-2 text-sm text-ink-secondary">{article.excerpt}</p>
          <div className="mt-3 flex items-center justify-between">
            <span className="link-arrow">
              Ler notícia <ArrowRight size={14} />
            </span>
            {showViews && (
              <span className="flex items-center gap-1 text-xs text-ink-muted">
                <Eye size={13} /> {formatViews(article.views)}
              </span>
            )}
          </div>
        </div>
      </Link>
    </article>
  )
}
