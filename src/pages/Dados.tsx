import { useMemo, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import FilterTabs from '@/components/ui/FilterTabs'
import DashboardCard from '@/components/ui/DashboardCard'
import EmptyState from '@/components/ui/EmptyState'
import SectionHeader from '@/components/ui/SectionHeader'
import Loading, { ErrorBox } from '@/components/ui/Loading'
import { DASHBOARD_CATEGORIES } from '@/data/misc'
import { getDashboards, getProjects } from '@/data/content'
import { useAsync } from '@/lib/useAsync'
import { formatDateShort } from '@/lib/format'

export default function Dados() {
  const [category, setCategory] = useState('Todos')
  const { data: dashboards, loading, error } = useAsync(getDashboards, [])
  const { data: projects } = useAsync(getProjects, [])

  const filtered = useMemo(
    () => (dashboards ?? []).filter((d) => category === 'Todos' || d.category === category),
    [dashboards, category],
  )

  return (
    <>
      <PageHeader
        eyebrow="Central de Indicadores"
        title="Dados"
        subtitle="Indicadores que ajudam a transformar informação em ação."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Dados' }]}
      />

      <div className="portal-container py-6">
        {/* Dashboards */}
        <SectionHeader title="Dashboards" />
        <div className="mb-4">
          <FilterTabs options={DASHBOARD_CATEGORIES} value={category} onChange={setCategory} />
        </div>
        {loading ? (
          <Loading label="Carregando dashboards..." />
        ) : error ? (
          <ErrorBox message={error} />
        ) : filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((d) => (
              <DashboardCard key={d.id} dashboard={d} />
            ))}
          </div>
        ) : (
          <EmptyState message="Nenhum dashboard nesta categoria." />
        )}

        {/* Projects */}
        <div className="mt-10">
          <SectionHeader title="Projetos em andamento" />
          <div className="card divide-y divide-line">
            {(projects ?? []).map((p) => (
              <div key={p.id} className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:gap-6">
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-ink">{p.name}</p>
                  <p className="text-xs text-ink-muted">
                    {p.owner} · {p.status} · Prazo {formatDateShort(p.deadline)}
                  </p>
                </div>
                <div className="flex items-center gap-3 sm:w-64">
                  <div className="h-2 flex-1 overflow-hidden rounded-full bg-bg-secondary">
                    <div className="h-full rounded-full bg-orange" style={{ width: `${p.progress}%` }} />
                  </div>
                  <span className="w-10 text-right text-sm font-bold text-ink">{p.progress}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <p className="mt-6 rounded-lg border border-dashed border-line bg-white p-4 text-center text-xs text-ink-muted">
          Preparado para receber links reais de Looker Studio, Power BI, Google Sheets e sistemas internos.
        </p>
      </div>
    </>
  )
}
