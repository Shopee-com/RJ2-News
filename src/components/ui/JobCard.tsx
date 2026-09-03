import { Link } from 'react-router-dom'
import { MapPin, Briefcase, Clock, ArrowRight } from 'lucide-react'
import type { Job } from '@/types'
import { formatDateLong } from '@/lib/format'
import Badge from './Badge'

export default function JobCard({ job }: { job: Job }) {
  return (
    <article className="card flex flex-col p-5 transition-shadow duration-200 hover:shadow-card-hover">
      <div className="mb-2 flex items-center gap-2">
        <Badge tone="orange">{job.model}</Badge>
        <span className="text-xs text-ink-muted">{formatDateLong(job.postedAt)}</span>
      </div>
      <h3 className="text-lg font-bold leading-snug text-ink">{job.title}</h3>
      <p className="mt-1.5 line-clamp-2 flex-1 text-sm text-ink-secondary">{job.summary}</p>

      <div className="mt-3 flex flex-wrap gap-x-4 gap-y-1.5 text-xs text-ink-secondary">
        <span className="flex items-center gap-1"><Briefcase size={13} className="text-ink-muted" /> {job.area}</span>
        <span className="flex items-center gap-1"><MapPin size={13} className="text-ink-muted" /> {job.location}</span>
        <span className="flex items-center gap-1"><Clock size={13} className="text-ink-muted" /> {job.shift}</span>
      </div>

      <Link
        to={`/vagas/${job.id}`}
        className="mt-4 flex items-center justify-center gap-1.5 rounded-lg bg-orange px-3 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-orange-hover"
      >
        Ver vaga <ArrowRight size={14} />
      </Link>
    </article>
  )
}
