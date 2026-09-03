import { Link } from 'react-router-dom'
import { ChevronRight } from 'lucide-react'

export interface Crumb {
  label: string
  to?: string
}

export default function Breadcrumb({ crumbs, className = '' }: { crumbs: Crumb[]; className?: string }) {
  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol className="flex flex-wrap items-center gap-1 text-xs text-ink-muted">
        {crumbs.map((c, i) => (
          <li key={i} className="flex items-center gap-1">
            {c.to && i < crumbs.length - 1 ? (
              <Link to={c.to} className="hover:text-orange">
                {c.label}
              </Link>
            ) : (
              <span className={i === crumbs.length - 1 ? 'font-semibold text-ink-secondary' : ''}>
                {c.label}
              </span>
            )}
            {i < crumbs.length - 1 && <ChevronRight size={12} />}
          </li>
        ))}
      </ol>
    </nav>
  )
}
