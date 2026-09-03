import { supabase } from '@/lib/supabase'

// ---------------------------------------------------------------------------
// Tipos das edições do JORNAL REVERSA
// ---------------------------------------------------------------------------
export interface EditionHero {
  title: string
  subtitle: string
  image: string
  cta_label: string
  body: string[]
  /** posição vertical da imagem de capa (0–100), 50 = centro */
  pos?: number
}

export interface EditionWeekModel {
  team: string
  focus: string
  checklist: string[]
  message: string
}

export interface EditionBestPractices {
  items: string[]
  tagline: string
}

export interface EditionGoldenRules {
  items: string[]
  tagline: string
  body: string[]
  image: string
  pos?: number
}

export interface EditionProject {
  name: string
  progress: number
}

export interface EditionEvent {
  day: string
  month: string
  title: string
  mode: string
  time: string
}

export interface EditionInterview {
  name: string
  role: string
  photo: string
  quote: string
  highlight: string
  pos?: number
}

export interface EditionFeature {
  title: string
  summary: string
  image: string
  pos?: number
  body: string[]
}

export type EditionStatus = 'draft' | 'scheduled' | 'published'

export interface Edition {
  id: string
  number: number
  edition_date: string
  status: EditionStatus
  publish_at: string | null
  views: number
  hero: EditionHero
  week_model: EditionWeekModel
  best_practices: EditionBestPractices
  golden_rules: EditionGoldenRules
  projects: EditionProject[]
  events: EditionEvent[]
  interview: EditionInterview
  processo: EditionFeature
  treinamento: EditionFeature
  announcements: string[]
  created_at?: string
  updated_at?: string
}

export function emptyEdition(nextNumber: number): Omit<Edition, 'id'> {
  return {
    number: nextNumber,
    edition_date: new Date().toISOString().slice(0, 10),
    status: 'draft',
    publish_at: null,
    views: 0,
    hero: { title: '', subtitle: '', image: '', cta_label: 'Ler matéria completa', body: [''], pos: 50 },
    week_model: { team: '', focus: '', checklist: [''], message: '' },
    best_practices: { items: [''], tagline: '' },
    golden_rules: { items: [], tagline: '', body: [''], image: '', pos: 50 },
    projects: [{ name: '', progress: 0 }],
    events: [{ day: '', month: '', title: '', mode: 'Online', time: '' }],
    interview: { name: '', role: '', photo: '', quote: '', highlight: '', pos: 50 },
    processo: { title: '', summary: '', image: '', pos: 50, body: [''] },
    treinamento: { title: '', summary: '', image: '', pos: 50, body: [''] },
    announcements: [''],
  }
}

// ---------------------------------------------------------------------------
// Leitura pública (respeitando RLS: só edições publicadas aparecem)
// ---------------------------------------------------------------------------
export async function fetchPublishedEditions(): Promise<Edition[]> {
  const { data, error } = await supabase
    .from('editions')
    .select('*')
    .order('number', { ascending: false })
  if (error) throw error
  return (data ?? []) as Edition[]
}

// ---------------------------------------------------------------------------
// Leitura admin (todas as edições, inclusive rascunho/agendada)
// ---------------------------------------------------------------------------
export async function fetchAllEditions(): Promise<Edition[]> {
  const { data, error } = await supabase
    .from('editions')
    .select('*')
    .order('number', { ascending: false })
  if (error) throw error
  return (data ?? []) as Edition[]
}

export async function fetchEditionById(id: string): Promise<Edition | null> {
  const { data, error } = await supabase.from('editions').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return (data as Edition) ?? null
}

export async function createEdition(edition: Omit<Edition, 'id'>): Promise<Edition> {
  const { data, error } = await supabase.from('editions').insert(edition).select().single()
  if (error) throw error
  return data as Edition
}

export async function updateEdition(id: string, patch: Partial<Edition>): Promise<Edition> {
  const { data, error } = await supabase.from('editions').update(patch).eq('id', id).select().single()
  if (error) throw error
  return data as Edition
}

export async function deleteEdition(id: string): Promise<void> {
  const { error } = await supabase.from('editions').delete().eq('id', id)
  if (error) throw error
}

export async function nextEditionNumber(): Promise<number> {
  const { data } = await supabase
    .from('editions')
    .select('number')
    .order('number', { ascending: false })
    .limit(1)
  const max = data && data.length ? (data[0] as { number: number }).number : 0
  return max + 1
}
