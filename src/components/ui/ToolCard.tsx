import { ExternalLink, Wrench } from 'lucide-react'
import type { Tool } from '@/types'
import { safeUrl } from '@/lib/url'
import Badge from './Badge'

export default function ToolCard({ tool }: { tool: Tool }) {
  return (
    <article className="card flex flex-col p-4 transition-shadow duration-200 hover:shadow-card-hover">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-light text-orange">
          <Wrench size={18} />
        </span>
        <Badge tone="neutral">{tool.category}</Badge>
      </div>
      <h3 className="text-base font-bold leading-snug text-ink">{tool.name}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-secondary">{tool.description}</p>
      <div className="mt-3 flex items-center justify-between border-t border-line pt-3 text-xs text-ink-muted">
        <span className="truncate">{tool.owner}</span>
        <span>{tool.version}</span>
      </div>
      <a
        href={safeUrl(tool.href)}
        target="_blank"
        rel="noopener noreferrer"
        className="mt-3 flex items-center justify-center gap-1.5 rounded-lg border border-line px-3 py-2 text-xs font-semibold text-ink transition-colors hover:border-orange hover:text-orange"
      >
        Abrir <ExternalLink size={13} />
      </a>
    </article>
  )
}
