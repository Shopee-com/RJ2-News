import { Link } from 'react-router-dom'
import { FileText, BarChart3, ClipboardList, Users } from 'lucide-react'
import { QUICK_LINKS_NAV } from '@/lib/nav'
import SectionHeader from '@/components/ui/SectionHeader'

const ICONS = [FileText, BarChart3, ClipboardList, Users]

export default function QuickLinksCard() {
  return (
    <div className="card flex h-full flex-col p-5">
      <SectionHeader title="Links Rápidos" />
      <div className="grid flex-1 grid-cols-2 gap-3">
        {QUICK_LINKS_NAV.map((link, i) => {
          const Icon = ICONS[i] ?? FileText
          return (
            <Link
              key={link.label}
              to={link.to}
              className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-line p-4 text-center transition-colors hover:border-orange"
            >
              <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-light text-orange">
                <Icon size={18} />
              </span>
              <span className="text-xs font-semibold text-ink group-hover:text-orange">{link.label}</span>
            </Link>
          )
        })}
      </div>
    </div>
  )
}
