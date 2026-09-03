import { kpis } from '@/data/misc'
import KpiCard from '@/components/ui/KpiCard'
import SectionHeader from '@/components/ui/SectionHeader'

export default function PerformancePanel() {
  return (
    <div className="card flex h-full flex-col p-5">
      <SectionHeader title="Desempenho Geral" linkLabel="Ver dashboard" linkTo="/dados" />
      <div className="grid flex-1 grid-cols-2 gap-3">
        {kpis.map((k) => (
          <KpiCard key={k.id} kpi={k} compact />
        ))}
      </div>
    </div>
  )
}
