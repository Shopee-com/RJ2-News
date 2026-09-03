import { Link } from 'react-router-dom'
import { getProjects } from '@/data/content'
import { useAsync } from '@/lib/useAsync'
import { formatDateShort } from '@/lib/format'
import SectionHeader from '@/components/ui/SectionHeader'

export default function ProjectProgress() {
  const { data } = useAsync(getProjects, [])
  const projects = data ?? []
  return (
    <div className="card flex h-full flex-col p-5">
      <SectionHeader title="Projetos em Andamento" linkLabel="Ver todos" linkTo="/dados" />
      <ul className="flex-1 space-y-4">
        {projects.map((p) => (
          <li key={p.id} className="group">
            <div className="mb-1 flex items-center justify-between text-sm">
              <span className="font-medium text-ink">{p.name}</span>
              <span className="font-bold text-ink">{p.progress}%</span>
            </div>
            <div className="h-2 overflow-hidden rounded-full bg-bg-secondary">
              <div
                className="h-full rounded-full bg-orange transition-all duration-500"
                style={{ width: `${p.progress}%` }}
              />
            </div>
            <div className="mt-1 hidden justify-between text-[11px] text-ink-muted group-hover:flex">
              <span>{p.owner} · {p.status}</span>
              <span>Prazo {formatDateShort(p.deadline)}</span>
            </div>
          </li>
        ))}
      </ul>
      <Link to="/dados" className="link-arrow mt-4">
        Ver todos os projetos →
      </Link>
    </div>
  )
}
