import { announcements } from '@/data/misc'
import SectionHeader from '@/components/ui/SectionHeader'

export default function AnnouncementsCard() {
  return (
    <div className="card flex h-full flex-col p-5">
      <SectionHeader title="Comunicados Importantes" linkLabel="Ver todos" linkTo="/novidades" />
      <ul className="flex-1 space-y-3">
        {announcements.map((a) => (
          <li key={a.id} className="flex items-start gap-2.5 text-sm text-ink-secondary">
            <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
            {a.text}
          </li>
        ))}
      </ul>
    </div>
  )
}
