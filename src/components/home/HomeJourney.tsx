import { useState } from 'react'
import { Link } from 'react-router-dom'
import { journey, getJourneyStep } from '@/data/journey'
import JourneyTimeline from '@/components/ui/JourneyTimeline'
import SectionHeader from '@/components/ui/SectionHeader'

export default function HomeJourney() {
  const [active, setActive] = useState('triagem')
  const step = getJourneyStep(active) ?? journey[0]

  return (
    <div className="card flex h-full flex-col p-5">
      <SectionHeader title="Jornada Reversa" linkLabel="Ver jornada completa" linkTo="/jornada" />
      <JourneyTimeline activeKey={active} onSelect={setActive} />

      <div className="mt-4 flex-1 rounded-lg bg-bg-secondary p-4">
        <h3 className="text-sm font-bold text-ink">{step.name}</h3>
        <p className="mt-0.5 text-xs font-medium text-orange">{step.short}</p>
        <p className="mt-2 text-sm text-ink-secondary">{step.description}</p>
      </div>

      <Link to={`/jornada/${step.key}`} className="btn-ghost mt-4">
        Ver detalhes da etapa
      </Link>
    </div>
  )
}
