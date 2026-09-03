import { ExternalLink, BarChart3 } from 'lucide-react'
import type { Dashboard } from '@/types'
import { formatDateShort } from '@/lib/format'
import { safeUrl } from '@/lib/url'
import Badge from './Badge'

export default function DashboardCard({ dashboard }: { dashboard: Dashboard }) {
  return (
    <article className="card flex flex-col p-4 transition-shadow duration-200 hover:shadow-card-hover">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-light text-orange">
          <BarChart3 size={18} />
        </span>
        <Badge tone="neutral">{dashboard.provider}</Badge>
      </div>
      <h3 className="text-base font-bold leading-snug text-ink">{dashboard.name}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-secondary">{dashboard.description}</p>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-muted">
        <span className="truncate">{dashboard.owner}</span>
        <span>Atual. {formatDateShort(dashboard.updatedAt)}</span>
      </div>
      <a
        href={safeUrl(dashboard.href)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg bg-orange px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-hover"
      >
        Abrir dashboard <ExternalLink size={13} />
      </a>
    </article>
  )
}
