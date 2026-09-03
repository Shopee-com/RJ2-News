import { Link } from 'react-router-dom'
import { MapPin, Clock } from 'lucide-react'
import type { Person } from '@/types'

export default function PeopleCard({ person }: { person: Person }) {
  return (
    <Link
      to={`/pessoas/${person.id}`}
      className="card group flex flex-col items-center p-5 text-center transition-shadow duration-200 hover:shadow-card-hover"
    >
      <img
        src={person.photo}
        alt={person.name}
        loading="lazy"
        className="h-20 w-20 rounded-full object-cover ring-2 ring-orange-light"
      />
      <h3 className="mt-3 text-sm font-bold text-ink group-hover:text-orange">{person.name}</h3>
      <p className="text-xs text-ink-secondary">{person.role}</p>
      <div className="mt-2 flex flex-wrap items-center justify-center gap-x-3 gap-y-1 text-[11px] text-ink-muted">
        <span className="flex items-center gap-1"><MapPin size={11} /> {person.region}</span>
        <span className="flex items-center gap-1"><Clock size={11} /> {person.shift}</span>
      </div>
    </Link>
  )
}
