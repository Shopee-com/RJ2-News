import { agenda } from '@/data/misc'
import SectionHeader from '@/components/ui/SectionHeader'

export default function AgendaCard() {
  return (
    <div className="card flex h-full flex-col p-5">
      <SectionHeader title="Agenda" linkLabel="Ver calendário completo" linkTo="/novidades" />
      <ul className="flex-1 divide-y divide-line">
        {agenda.map((ev) => (
          <li key={ev.id} className="flex items-center gap-3 py-2.5 first:pt-0">
            <div className="flex h-11 w-11 shrink-0 flex-col items-center justify-center rounded-lg bg-orange-light leading-none text-orange">
              <span className="text-sm font-extrabold">{ev.day}</span>
              <span className="text-[10px] font-bold uppercase">{ev.month}</span>
            </div>
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-ink">{ev.title}</p>
              <p className="text-xs text-ink-muted">
                {ev.mode} • {ev.time}
              </p>
            </div>
          </li>
        ))}
      </ul>
    </div>
  )
}
