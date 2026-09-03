import { useParams, Link } from 'react-router-dom'
import { MapPin, Briefcase, Clock, Globe, ArrowLeft, Send } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Loading from '@/components/ui/Loading'
import { getJobById } from '@/data/content'
import { getSettings } from '@/data/settings'
import { useAsync } from '@/lib/useAsync'
import { safeUrl } from '@/lib/url'
import { formatDateLong } from '@/lib/format'

export default function JobDetail() {
  const { id = '' } = useParams()
  const { data: job, loading } = useAsync(() => getJobById(id), [id])
  const { data: settings } = useAsync(getSettings, [])

  if (loading) return <Loading label="Carregando vaga..." />

  if (!job) {
    return (
      <div className="portal-container py-16">
        <EmptyState message="Vaga não encontrada." />
        <div className="mt-4 text-center">
          <Link to="/vagas" className="link-arrow justify-center">← Voltar para Vagas</Link>
        </div>
      </div>
    )
  }

  const responsibilities = [
    'Executar as atividades da área conforme os POPs vigentes.',
    'Acompanhar indicadores e propor melhorias contínuas.',
    'Colaborar com a comunicação ativa entre turnos.',
    'Registrar exceções e apoiar a resolução de ocorrências.',
  ]
  const requirements = [
    'Experiência prévia em operações logísticas (desejável).',
    'Organização, atenção a detalhes e foco em resultado.',
    'Boa comunicação e trabalho em equipe.',
    'Disponibilidade para o turno indicado.',
  ]

  // link da própria vaga; se vazio, usa o link padrão das Configurações
  const applyUrl = safeUrl(job.applyUrl || settings?.jobs_apply_url || 'https://careers.shopee.com.br/')

  return (
    <>
      <PageHeader
        eyebrow={job.area}
        title={job.title}
        subtitle={job.summary}
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Vagas', to: '/vagas' }, { label: job.title }]}
        actions={
          <a href={applyUrl} target="_blank" rel="noopener noreferrer" className="btn-primary">
            <Send size={15} /> Candidatar-se
          </a>
        }
      />

      <div className="portal-container grid gap-6 py-6 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-3 text-lg font-bold text-ink">Responsabilidades</h2>
            <ul className="space-y-2">
              {responsibilities.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-ink-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" /> {r}
                </li>
              ))}
            </ul>
          </div>
          <div className="card p-6">
            <h2 className="mb-3 text-lg font-bold text-ink">Requisitos</h2>
            <ul className="space-y-2">
              {requirements.map((r) => (
                <li key={r} className="flex items-start gap-2 text-sm text-ink-secondary">
                  <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" /> {r}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <div className="mb-3 flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Detalhes</h3>
              <Badge>{job.model}</Badge>
            </div>
            <dl className="space-y-3 text-sm">
              {[
                { icon: Briefcase, k: 'Área', v: job.area },
                { icon: MapPin, k: 'Local', v: job.location },
                { icon: Clock, k: 'Turno', v: job.shift },
                { icon: Globe, k: 'Região', v: job.region },
              ].map(({ icon: Icon, k, v }) => (
                <div key={k} className="flex items-center gap-3">
                  <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-light text-orange">
                    <Icon size={14} />
                  </span>
                  <div>
                    <dt className="text-xs text-ink-muted">{k}</dt>
                    <dd className="font-semibold text-ink">{v}</dd>
                  </div>
                </div>
              ))}
            </dl>
            <p className="mt-4 border-t border-line pt-3 text-xs text-ink-muted">
              Publicada em {formatDateLong(job.postedAt)}
            </p>
          </div>
          <Link to="/vagas" className="btn-ghost w-full">
            <ArrowLeft size={15} /> Voltar para Vagas
          </Link>
        </aside>
      </div>
    </>
  )
}
