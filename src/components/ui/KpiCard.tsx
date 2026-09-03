import { TrendingDown, TrendingUp } from 'lucide-react'
import type { Kpi } from '@/types'

export default function KpiCard({ kpi, compact = false }: { kpi: Kpi; compact?: boolean }) {
  const good = kpi.trend === 'down-good' ? kpi.delta.startsWith('-') : !kpi.delta.startsWith('-')
  const Arrow = kpi.delta.startsWith('-') ? TrendingDown : TrendingUp

  return (
    <div className={`rounded-lg border border-line bg-white ${compact ? 'p-3' : 'p-4'}`}>
      <p className="text-label font-bold uppercase tracking-wide text-ink-muted">{kpi.label}</p>
      <p className={`mt-1 font-extrabold text-ink ${compact ? 'text-xl' : 'text-2xl'}`}>{kpi.value}</p>
      <div className="mt-1 flex items-center justify-between">
        <span className="text-xs text-ink-muted">{kpi.target}</span>
        <span className={`flex items-center gap-0.5 text-xs font-semibold ${good ? 'text-success' : 'text-danger'}`}>
          <Arrow size={13} /> {kpi.delta}
        </span>
      </div>
    </div>
  )
}
