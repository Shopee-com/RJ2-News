import type { Project } from '@/types'

export const projects: Project[] = [
  {
    id: 'pr1',
    name: 'Automação da Triagem',
    progress: 75,
    owner: 'PMO Reversa',
    status: 'No prazo',
    deadline: '2026-07-30',
    lastUpdate: '2026-05-25',
  },
  {
    id: 'pr2',
    name: 'Dashboard de Performance',
    progress: 60,
    owner: 'BI Reversa',
    status: 'No prazo',
    deadline: '2026-06-30',
    lastUpdate: '2026-05-24',
  },
  {
    id: 'pr3',
    name: 'Roteirização Inteligente',
    progress: 45,
    owner: 'Engenharia Logística',
    status: 'Atenção',
    deadline: '2026-08-15',
    lastUpdate: '2026-05-22',
  },
  {
    id: 'pr4',
    name: 'Redução de MisRoute',
    progress: 30,
    owner: 'Qualidade Reversa',
    status: 'Atenção',
    deadline: '2026-09-10',
    lastUpdate: '2026-05-20',
  },
]

export function getProjectById(id: string): Project | undefined {
  return projects.find((p) => p.id === id)
}
