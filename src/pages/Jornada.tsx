import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Target, Users, TrendingUp, ShieldAlert, Wrench, ArrowRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import JourneyTimeline from '@/components/ui/JourneyTimeline'
import { journey, getJourneyStep } from '@/data/journey'

export default function Jornada() {
  const [active, setActive] = useState('coleta')
  const step = getJourneyStep(active) ?? journey[0]

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
        eyebrow="Fluxo Operacional"
        title="Jornada Reversa"
        subtitle="Do recebimento ao destino final, entenda cada etapa."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Jornada Reversa' }]}
      />

      <div className="portal-container py-6">
        <div className="card p-5 sm:p-6">
          <JourneyTimeline activeKey={active} onSelect={setActive} numbered />
        </div>

        <div className="mt-6 grid gap-6 lg:grid-cols-3">
          <div className="lg:col-span-1">
            <div className="card p-6">
              <span className="label-chip text-orange">Etapa {String(step.order).padStart(2, '0')}</span>
              <h2 className="mt-1 text-2xl font-extrabold text-ink">{step.name}</h2>
              <p className="mt-3 text-sm leading-relaxed text-ink-secondary">{step.description}</p>
              <Link to={`/pop`} className="link-arrow mt-4">
                POP relacionado: {step.relatedPop} <ArrowRight size={14} />
              </Link>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2 lg:col-span-2">
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
        </div>

        <div className="mt-6 flex justify-center">
          <Link to={`/jornada/${step.key}`} className="btn-primary">
            Ver detalhes completos da etapa <ArrowRight size={16} />
          </Link>
        </div>
      </div>
    </>
  )
}
