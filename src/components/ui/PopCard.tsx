import { Link } from 'react-router-dom'
import { Eye, Download, FileText, Lock } from 'lucide-react'
import type { Pop } from '@/types'
import { formatDateShort } from '@/lib/format'
import { safeUrl } from '@/lib/url'
import { useAuth } from '@/lib/auth'
import Badge from './Badge'

const STATUS_TONE = {
  Vigente: 'success',
  'Em revisão': 'warn',
  Arquivado: 'neutral',
} as const

export default function PopCard({ pop }: { pop: Pop }) {
  const { isAdmin } = useAuth()
  const locked = pop.status === 'Em revisão' && !isAdmin
  return (
    <article className="card flex flex-col p-4 transition-shadow duration-200 hover:shadow-card-hover">
      <div className="mb-3 flex items-start justify-between gap-2">
        <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-light text-orange">
          <FileText size={18} />
        </span>
        <Badge tone={STATUS_TONE[pop.status]}>{pop.status}</Badge>
      </div>

      <p className="text-xs font-bold uppercase tracking-wide text-orange">{pop.code}</p>
      <h3 className="mt-0.5 text-base font-bold leading-snug text-ink">{pop.name}</h3>
      <p className="mt-2 line-clamp-2 flex-1 text-sm text-ink-secondary">{pop.summary}</p>

      <dl className="mt-3 grid grid-cols-2 gap-y-1.5 border-t border-line pt-3 text-xs">
        <div>
          <dt className="text-ink-muted">Categoria</dt>
          <dd className="font-semibold text-ink">{pop.category}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Versão</dt>
          <dd className="font-semibold text-ink">{pop.version}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Atualização</dt>
          <dd className="font-semibold text-ink">{formatDateShort(pop.updatedAt)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted">Responsável</dt>
          <dd className="truncate font-semibold text-ink">{pop.owner}</dd>
        </div>
      </dl>

      <div className="mt-4 flex items-center gap-2">
        {locked ? (
          <span
            className="flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-lg border border-line bg-bg-secondary px-3 py-2 text-xs font-semibold text-ink-muted"
            title="Procedimento em revisão — indisponível para visualização"
          >
            <Lock size={14} /> Em revisão
          </span>
        ) : (
          <Link
            to={`/pop/${pop.id}`}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-lg bg-orange px-3 py-2 text-xs font-semibold text-white transition-colors hover:bg-orange-hover"
          >
            <Eye size={14} /> Visualizar
          </Link>
        )}
        {!locked && pop.downloadUrl ? (
          <a
            href={safeUrl(pop.downloadUrl)}
            target="_blank"
            rel="noopener noreferrer"
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-line text-ink-secondary transition-colors hover:border-orange hover:text-orange"
            aria-label="Baixar"
          >
            <Download size={15} />
          </a>
        ) : null}
      </div>
    </article>
  )
}
