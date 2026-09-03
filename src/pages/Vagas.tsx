import { useMemo, useState } from 'react'
import PageHeader from '@/components/ui/PageHeader'
import FilterTabs from '@/components/ui/FilterTabs'
import JobCard from '@/components/ui/JobCard'
import EmptyState from '@/components/ui/EmptyState'
import Loading, { ErrorBox } from '@/components/ui/Loading'
import { getJobs } from '@/data/content'
import { useAsync } from '@/lib/useAsync'

const MODELS = ['Todos', 'Presencial', 'Híbrido', 'Remoto']

export default function Vagas() {
  const [model, setModel] = useState('Todos')
  const { data: jobs, loading, error } = useAsync(getJobs, [])

  const filtered = useMemo(
    () => (jobs ?? []).filter((j) => model === 'Todos' || j.model === model),
    [jobs, model],
  )

  return (
    <>
      <PageHeader
        eyebrow="Trabalhe na Reversa"
        title="Oportunidades"
        subtitle="Faça parte do time que transforma a Logística Reversa."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Vagas' }]}
      />
      <div className="portal-container py-6">
        <div className="mb-4">
          <FilterTabs options={MODELS} value={model} onChange={setModel} />
        </div>
        {loading ? (
          <Loading label="Carregando vagas..." />
        ) : error ? (
          <ErrorBox message={error} />
        ) : filtered.length ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((j) => (
              <JobCard key={j.id} job={j} />
            ))}
          </div>
        ) : (
          <EmptyState message="Nenhuma vaga neste modelo." />
        )}
      </div>
    </>
  )
}
