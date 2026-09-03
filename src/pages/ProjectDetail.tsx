import { useParams, Link } from 'react-router-dom'
import { ArrowLeft, CalendarClock, User, Activity } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Loading from '@/components/ui/Loading'
import { getProjectById } from '@/data/content'
import { useAsync } from '@/lib/useAsync'
import { formatDateShort } from '@/lib/format'

const STATUS_TONE = {
  'No prazo': 'success',
  Atenção: 'warn',
  Atrasado: 'danger',
  Concluído: 'info',
} as const

export default function ProjectDetail() {
  const { id = '' } = useParams()
  const { data: project, loading } = useAsync(() => getProjectById(id), [id])

  if (loading) return <Loading label="Carregando projeto..." />

  if (!project) {
    return (
      <div className="portal-container py-16">
        <EmptyState message="Projeto não encontrado." />
        <div className="mt-4 text-center">
          <Link to="/dados" className="link-arrow justify-center">← Voltar para Dados</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow="Projeto"
        title={project.name}
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Dados', to: '/dados' }, { label: project.name }]}
        actions={<Badge tone={STATUS_TONE[project.status]}>{project.status}</Badge>}
      />

      <div className="portal-container py-6">
        <div className="card p-6">
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-ink">Progresso</span>
            <span className="text-lg font-extrabold text-ink">{project.progress}%</span>
          </div>
          <div className="h-3 overflow-hidden rounded-full bg-bg-secondary">
            <div className="h-full rounded-full bg-orange transition-all duration-500" style={{ width: `${project.progress}%` }} />
          </div>

          <dl className="mt-6 grid gap-4 sm:grid-cols-3">
            {[
              { icon: User, k: 'Responsável', v: project.owner },
              { icon: CalendarClock, k: 'Prazo', v: formatDateShort(project.deadline) },
              { icon: Activity, k: 'Última atualização', v: formatDateShort(project.lastUpdate) },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-light text-orange">
                  <Icon size={15} />
                </span>
                <div>
                  <dt className="text-xs text-ink-muted">{k}</dt>
                  <dd className="text-sm font-semibold text-ink">{v}</dd>
                </div>
              </div>
            ))}
          </dl>
        </div>

        <Link to="/dados" className="btn-ghost mt-6 w-fit">
          <ArrowLeft size={15} /> Voltar para Dados
        </Link>
      </div>
    </>
  )
}
