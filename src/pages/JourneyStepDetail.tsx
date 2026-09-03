import { useParams, Link } from 'react-router-dom'
import { Target, Users, TrendingUp, ShieldAlert, Wrench, FileText, ArrowLeft, ArrowRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import { journey, getJourneyStep } from '@/data/journey'

export default function JourneyStepDetail() {
  const { etapa = '' } = useParams()
  const step = getJourneyStep(etapa)

  if (!step) {
    return (
      <div className="portal-container py-16">
        <EmptyState message="Etapa não encontrada." />
        <div className="mt-4 text-center">
          <Link to="/jornada" className="link-arrow justify-center">← Voltar para a Jornada</Link>
        </div>
      </div>
    )
  }

  const idx = journey.findIndex((j) => j.key === step.key)
  const prev = journey[idx - 1]
  const next = journey[idx + 1]

  const blocks = [
    { icon: Target, title: 'Objetivo', items: [step.objective] },
    { icon: Users, title: 'Responsáveis', items: step.responsibles },
    { icon: TrendingUp, title: 'Indicadores', items: step.indicators },
    { icon: TrendingUp, title: 'Boas práticas', items: step.bestPractices },
    { icon: ShieldAlert, title: 'Riscos', items: step.risks },
    { icon: Wrench, title: 'Ferramentas', items: step.tools },
  ]

  return (
    <>
      <PageHeader
        eyebrow={`Etapa ${String(step.order).padStart(2, '0')}`}
        title={step.name}
        subtitle={step.description}
        crumbs={[
          { label: 'Início', to: '/' },
          { label: 'Jornada Reversa', to: '/jornada' },
          { label: step.name },
        ]}
        actions={
          <Link to="/pop" className="btn-ghost">
            <FileText size={15} /> {step.relatedPop}
          </Link>
        }
      />

      <div className="portal-container py-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {blocks.map(({ icon: Icon, title, items }) => (
            <div key={title} className="card p-5">
              <div className="mb-2 flex items-center gap-2">
                <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-orange-light text-orange">
                  <Icon size={15} />
                </span>
                <h3 className="text-sm font-bold text-ink">{title}</h3>
              </div>
              <ul className="space-y-1.5">
                {items.map((it) => (
                  <li key={it} className="flex items-start gap-2 text-sm text-ink-secondary">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
                    {it}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center justify-between">
          {prev ? (
            <Link to={`/jornada/${prev.key}`} className="btn-ghost">
              <ArrowLeft size={15} /> {prev.name}
            </Link>
          ) : (
            <span />
          )}
          {next && (
            <Link to={`/jornada/${next.key}`} className="btn-primary">
              {next.name} <ArrowRight size={15} />
            </Link>
          )}
        </div>
      </div>
    </>
  )
}
