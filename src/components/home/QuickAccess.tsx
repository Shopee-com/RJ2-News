import { Link } from 'react-router-dom'
import { FileText, BarChart3, Wrench, Route, ArrowRight } from 'lucide-react'

const ITEMS = [
  { icon: FileText, title: 'POP', desc: 'Procedimentos padrão da operação', to: '/pop' },
  { icon: BarChart3, title: 'Dados', desc: 'Indicadores e dashboards em tempo real', to: '/dados' },
  { icon: Wrench, title: 'SPX Reverser', desc: 'Ferramentas e materiais para a operação reversa', to: '/reverser' },
  { icon: Route, title: 'Jornada Reversa', desc: 'Acompanhe cada etapa da jornada reversa', to: '/jornada' },
]

export default function QuickAccess() {
  return (
    <div className="grid h-full grid-cols-2 gap-3">
      {ITEMS.map(({ icon: Icon, title, desc, to }) => (
        <Link
          key={title}
          to={to}
          className="card group flex flex-col justify-between p-4 transition-all duration-200 hover:border-orange hover:shadow-card-hover"
        >
          <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-light text-orange">
            <Icon size={18} />
          </span>
          <div className="mt-3">
            <h3 className="text-sm font-bold text-ink group-hover:text-orange">{title}</h3>
            <p className="mt-0.5 line-clamp-2 text-xs text-ink-secondary">{desc}</p>
            <span className="mt-2 flex items-center gap-1 text-xs font-semibold text-orange">
              Acessar <ArrowRight size={12} className="transition-transform duration-200 group-hover:translate-x-0.5" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  )
}
