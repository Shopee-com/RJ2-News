import { Link } from 'react-router-dom'
import { ArrowRight, Megaphone, GraduationCap, RefreshCw, Award } from 'lucide-react'
import { reversaNow, type ReversaNowItem } from '@/data/misc'
import { getReversaNow } from '@/data/content'
import { useAsync } from '@/lib/useAsync'

const ICONS: Record<ReversaNowItem['category'], typeof Megaphone> = {
  Comunicado: Megaphone,
  Treinamento: GraduationCap,
  Atualização: RefreshCw,
  Reconhecimento: Award,
}

export default function ReversaNow() {
  const { data } = useAsync(getReversaNow, [])
  const items = data && data.length ? data : reversaNow
  return (
    <div className="flex h-full flex-col rounded-card bg-dark p-5 text-white">
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-bold uppercase tracking-wide">Reversa Agora</h2>
        <Link to="/novidades" className="flex items-center gap-1 text-xs font-semibold text-orange hover:text-orange-bright">
          Ver todos <ArrowRight size={13} />
        </Link>
      </div>

      <ul className="flex flex-1 flex-col divide-y divide-white/10">
        {items.map((item) => {
          const Icon = ICONS[item.category]
          return (
            <li key={item.id} className="flex items-start gap-3 py-3 first:pt-0 last:pb-0">
              <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-white/10 text-orange">
                <Icon size={15} />
              </span>
              <div className="min-w-0">
                <span className="text-label font-bold uppercase tracking-wide text-orange">
                  {item.category}
                </span>
                <p className="text-sm font-medium leading-snug text-white">{item.title}</p>
                <p className="mt-0.5 text-xs text-on-dark-secondary">{item.when}</p>
              </div>
            </li>
          )
        })}
      </ul>
    </div>
  )
}
