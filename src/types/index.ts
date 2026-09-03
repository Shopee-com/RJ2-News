// ============================================================
// SPX REVERSA — Domain types
// Centralized so mock data and (future) Supabase share one shape.
// ============================================================

export type Category =
  | 'Operação'
  | 'Processos'
  | 'Performance'
  | 'Pessoas'
  | 'Comunicados'
  | 'Treinamentos'
  | 'Projetos'

export interface NewsArticle {
  id: string
  slug: string
  category: Category
  title: string
  excerpt: string
  content: string[]
  image: string
  date: string // ISO
  author: string
  authorRole: string
  readingMinutes: number
  views: number
  featured?: boolean
}

export type PopCategory =
  | 'Inbound'
  | 'Triagem'
  | 'EHA'
  | 'Outbound'
  | 'Returns'
  | 'RTS'
  | 'Loss'
  | 'Security'
  | 'Auditoria'

export type PopStatus = 'Vigente' | 'Em revisão' | 'Arquivado'

export interface Pop {
  id: string
  code: string
  name: string
  category: PopCategory
  version: string
  updatedAt: string // ISO
  owner: string
  status: PopStatus
  summary: string
  steps: string[]
  downloadUrl?: string
}

export interface Project {
  id: string
  name: string
  progress: number
  owner: string
  status: 'No prazo' | 'Atenção' | 'Atrasado' | 'Concluído'
  deadline: string
  lastUpdate: string
}

export interface JourneyStep {
  id: string
  order: number
  key: string
  name: string
  short: string
  description: string
  objective: string
  responsibles: string[]
  relatedPop: string
  indicators: string[]
  bestPractices: string[]
  risks: string[]
  tools: string[]
}

export interface Person {
  id: string
  name: string
  role: string
  region: string
  shift: string
  contact: string
  photo: string
  level: string
  quote?: string
}

export interface AgendaEvent {
  id: string
  day: string
  month: string
  title: string
  mode: 'Online' | 'Presencial'
  time: string
}

export interface Announcement {
  id: string
  text: string
  href?: string
}

export type NotificationType =
  | 'Novo POP'
  | 'Atualização'
  | 'Comunicado'
  | 'Treinamento'
  | 'Projeto'
  | 'Reconhecimento'

export interface Notification {
  id: string
  type: NotificationType
  title: string
  time: string
  read: boolean
}

export interface Dashboard {
  id: string
  name: string
  category: string
  description: string
  owner: string
  updatedAt: string
  provider: 'Looker Studio' | 'Power BI' | 'Google Sheets' | 'Sistema Interno'
  href: string
}

export interface Tool {
  id: string
  name: string
  category: string
  description: string
  owner: string
  version: string
  href: string
}

export interface Job {
  id: string
  title: string
  area: string
  location: string
  model: 'Presencial' | 'Híbrido' | 'Remoto'
  shift: string
  region: string
  postedAt: string
  summary: string
  applyUrl?: string
}

export interface Kpi {
  id: string
  label: string
  value: string
  target: string
  delta: string
  trend: 'up-good' | 'down-good'
}

export interface QuickLink {
  id: string
  label: string
  icon: string
}
