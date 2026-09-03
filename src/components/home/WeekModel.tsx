import { CheckCircle2, Trophy } from 'lucide-react'
import { weekModel } from '@/data/misc'
import SectionHeader from '@/components/ui/SectionHeader'

export default function WeekModel() {
  return (
    <div className="card flex h-full flex-col p-5">
      <SectionHeader title={`Modelo da Semana — ${weekModel.team}`} linkLabel="Ver todos" linkTo="/time" />
      <p className="mb-3 text-xs font-bold uppercase tracking-wide text-orange">
        Foco: {weekModel.focus}
      </p>
      <ul className="flex-1 space-y-2">
        {weekModel.checklist.map((item) => (
          <li key={item} className="flex items-center gap-2 text-sm text-ink">
            <CheckCircle2 size={16} className="shrink-0 text-success" />
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-4 flex items-start gap-2 rounded-lg bg-orange-light p-3">
        <Trophy size={18} className="mt-0.5 shrink-0 text-orange" />
        <p className="text-xs font-medium text-ink">{weekModel.message}</p>
      </div>
    </div>
  )
}
