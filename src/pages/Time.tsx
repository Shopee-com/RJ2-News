import { useMemo, useState } from 'react'
import { Search } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import FilterTabs from '@/components/ui/FilterTabs'
import PeopleCard from '@/components/ui/PeopleCard'
import EmptyState from '@/components/ui/EmptyState'
import SectionHeader from '@/components/ui/SectionHeader'
import Loading, { ErrorBox } from '@/components/ui/Loading'
import { REGIONS, PEOPLE_LEVELS } from '@/data/people'
import { getPeople } from '@/data/content'
import { useAsync } from '@/lib/useAsync'

const LEVELS = PEOPLE_LEVELS

export default function Time() {
  const [region, setRegion] = useState('Todos')
  const [query, setQuery] = useState('')
  const { data: peopleData, loading, error } = useAsync(getPeople, [])
  const people = peopleData ?? []

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return people.filter((p) => {
      const byRegion = region === 'Todos' || p.region === region
      const byQuery = !q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q)
      return byRegion && byQuery
    })
  }, [people, region, query])

  return (
    <>
      <PageHeader
        eyebrow="Pessoas da Reversa"
        title="Nosso Time"
        subtitle="Conheça quem faz a Logística Reversa acontecer todos os dias."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Time' }]}
      />

      <div className="portal-container py-6">
        <div className="mb-6 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
          <div className="relative w-full max-w-md">
            <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-muted" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Buscar pessoa..."
              className="h-10 w-full rounded-lg border border-line bg-white pl-9 pr-3 text-sm outline-none placeholder:text-ink-muted focus:border-orange"
            />
          </div>
          <FilterTabs options={REGIONS} value={region} onChange={setRegion} />
        </div>

        {/* Organograma por nível */}
        {loading ? (
          <Loading label="Carregando time..." />
        ) : error ? (
          <ErrorBox message={error} />
        ) : query.trim() === '' && region === 'Todos' ? (
          <div className="space-y-8">
            {LEVELS.map((level) => {
              const group = people.filter((p) => p.level === level)
              if (!group.length) return null
              return (
                <div key={level}>
                  <SectionHeader title={level} />
                  <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
                    {group.map((p) => (
                      <PeopleCard key={p.id} person={p} />
                    ))}
                  </div>
                </div>
              )
            })}
          </div>
        ) : filtered.length ? (
          <div className="grid gap-4 grid-cols-2 sm:grid-cols-3 lg:grid-cols-5">
            {filtered.map((p) => (
              <PeopleCard key={p.id} person={p} />
            ))}
          </div>
        ) : (
          <EmptyState message="Nenhuma pessoa encontrada." />
        )}
      </div>
    </>
  )
}
