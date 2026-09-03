import { journey } from '@/data/journey'
import { getNews, getPops, getDashboards, getTools, getPeople, getJobs } from '@/data/content'

export type SearchGroup =
  | 'POP'
  | 'Notícias'
  | 'Dados'
  | 'Ferramentas'
  | 'Pessoas'
  | 'Jornada'
  | 'Vagas'

export interface SearchResult {
  group: SearchGroup
  title: string
  subtitle: string
  to: string
}

export const SEARCH_GROUPS: SearchGroup[] = [
  'POP',
  'Notícias',
  'Dados',
  'Ferramentas',
  'Pessoas',
  'Jornada',
  'Vagas',
]

let cache: Promise<SearchResult[]> | null = null

async function build(): Promise<SearchResult[]> {
  const [pops, news, dashboards, tools, people, jobs] = await Promise.all([
    getPops(),
    getNews(),
    getDashboards(),
    getTools(),
    getPeople(),
    getJobs(),
  ])

  return [
    ...pops.map((p) => ({
      group: 'POP' as const,
      title: `${p.code} — ${p.name}`,
      subtitle: `${p.category} · ${p.version} · ${p.status}`,
      to: `/pop/${p.id}`,
    })),
    ...news.map((n) => ({
      group: 'Notícias' as const,
      title: n.title,
      subtitle: `${n.category} · ${n.author}`,
      to: `/novidades/${n.slug}`,
    })),
    ...dashboards.map((d) => ({
      group: 'Dados' as const,
      title: d.name,
      subtitle: `${d.category} · ${d.provider}`,
      to: `/dados`,
    })),
    ...tools.map((t) => ({
      group: 'Ferramentas' as const,
      title: t.name,
      subtitle: `${t.category} · ${t.version}`,
      to: `/reverser`,
    })),
    ...people.map((p) => ({
      group: 'Pessoas' as const,
      title: p.name,
      subtitle: `${p.role} · ${p.region}`,
      to: `/pessoas/${p.id}`,
    })),
    ...journey.map((j) => ({
      group: 'Jornada' as const,
      title: `${String(j.order).padStart(2, '0')} — ${j.name}`,
      subtitle: j.short,
      to: `/jornada/${j.key}`,
    })),
    ...jobs.map((v) => ({
      group: 'Vagas' as const,
      title: v.title,
      subtitle: `${v.area} · ${v.location}`,
      to: `/vagas/${v.id}`,
    })),
  ]
}

export function loadSearchIndex(): Promise<SearchResult[]> {
  if (!cache) cache = build().catch((e) => {
    cache = null
    throw e
  })
  return cache
}

export function filterResults(
  index: SearchResult[],
  query: string,
  group?: SearchGroup | 'Todos',
): SearchResult[] {
  const q = query.trim().toLowerCase()
  if (!q) return []
  return index.filter((r) => {
    const matchesGroup = !group || group === 'Todos' || r.group === group
    const matchesQuery =
      r.title.toLowerCase().includes(q) || r.subtitle.toLowerCase().includes(q)
    return matchesGroup && matchesQuery
  })
}

export function groupResults(results: SearchResult[]): Record<string, SearchResult[]> {
  return results.reduce<Record<string, SearchResult[]>>((acc, r) => {
    ;(acc[r.group] ??= []).push(r)
    return acc
  }, {})
}
