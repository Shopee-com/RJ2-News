import { supabase } from '@/lib/supabase'
import type { NewsArticle, Pop, Dashboard, Tool, Job, Person, Project } from '@/types'
import type { ReversaNowItem } from '@/data/misc'

// ===========================================================================
// Mapeadores: linha do banco (snake_case) -> tipo da aplicação (camelCase)
// ===========================================================================
/* eslint-disable @typescript-eslint/no-explicit-any */

function mapNews(r: any): NewsArticle {
  return {
    id: r.id,
    slug: r.slug,
    category: r.category,
    title: r.title,
    excerpt: r.excerpt ?? '',
    content: Array.isArray(r.content) ? r.content : [],
    image: r.image ?? '',
    date: (r.publish_at ?? r.created_at ?? '').slice(0, 10),
    author: r.author ?? '',
    authorRole: r.author_role ?? '',
    readingMinutes: r.reading_minutes ?? 3,
    views: r.views ?? 0,
    featured: !!r.featured,
  }
}

function mapPop(r: any): Pop {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category,
    version: r.version ?? '',
    updatedAt: r.doc_updated ?? '',
    owner: r.owner ?? '',
    status: r.status,
    summary: r.summary ?? '',
    steps: Array.isArray(r.steps) ? r.steps : [],
    downloadUrl: r.download_url ?? '',
  }
}

function mapDashboard(r: any): Dashboard {
  return {
    id: r.id,
    name: r.name,
    category: r.category ?? '',
    description: r.description ?? '',
    owner: r.owner ?? '',
    updatedAt: r.doc_updated ?? '',
    provider: r.provider,
    href: r.href ?? '#',
  }
}

function mapTool(r: any): Tool {
  return {
    id: r.id,
    name: r.name,
    category: r.category ?? '',
    description: r.description ?? '',
    owner: r.owner ?? '',
    version: r.version ?? '',
    href: r.href ?? '#',
  }
}

function mapJob(r: any): Job {
  return {
    id: r.id,
    title: r.title,
    area: r.area ?? '',
    location: r.location ?? '',
    model: r.model,
    shift: r.shift ?? '',
    region: r.region ?? '',
    postedAt: r.posted_at ?? '',
    summary: r.summary ?? '',
    applyUrl: r.apply_url ?? '',
  }
}

function mapPerson(r: any): Person {
  return {
    id: r.id,
    name: r.name,
    role: r.role ?? '',
    region: r.region ?? '',
    shift: r.shift ?? '',
    contact: r.contact ?? '',
    photo: r.photo ?? '',
    level: r.level,
    quote: r.quote ?? undefined,
  }
}

function mapProject(r: any): Project {
  return {
    id: r.id,
    name: r.name,
    progress: r.progress ?? 0,
    owner: r.owner ?? '',
    status: r.status,
    deadline: r.deadline ?? '',
    lastUpdate: r.last_update ?? '',
  }
}

// ===========================================================================
// Leitura pública (RLS deixa passar só o conteúdo publicado)
// ===========================================================================
export async function getNews(): Promise<NewsArticle[]> {
  const { data, error } = await supabase.from('news').select('*').order('publish_at', { ascending: false })
  if (error) throw error
  return (data ?? []).map(mapNews)
}

export async function getNewsBySlug(slug: string): Promise<NewsArticle | null> {
  const { data, error } = await supabase.from('news').select('*').eq('slug', slug).maybeSingle()
  if (error) throw error
  return data ? mapNews(data) : null
}

export async function incrementNewsViews(slug: string): Promise<number | null> {
  const { data, error } = await supabase.rpc('increment_news_views', { p_slug: slug })
  if (error) throw error
  return (data as number) ?? null
}

export async function getPops(): Promise<Pop[]> {
  const { data, error } = await supabase.from('pops').select('*').order('sort')
  if (error) throw error
  return (data ?? []).map(mapPop)
}

export async function getPopById(id: string): Promise<Pop | null> {
  const { data, error } = await supabase.from('pops').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapPop(data) : null
}

export async function getDashboards(): Promise<Dashboard[]> {
  const { data, error } = await supabase.from('dashboards').select('*').order('sort')
  if (error) throw error
  return (data ?? []).map(mapDashboard)
}

export async function getTools(): Promise<Tool[]> {
  const { data, error } = await supabase.from('tools').select('*').order('sort')
  if (error) throw error
  return (data ?? []).map(mapTool)
}

export async function getJobs(): Promise<Job[]> {
  const { data, error } = await supabase.from('jobs').select('*').order('sort')
  if (error) throw error
  return (data ?? []).map(mapJob)
}

export async function getJobById(id: string): Promise<Job | null> {
  const { data, error } = await supabase.from('jobs').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapJob(data) : null
}

export async function getPeople(): Promise<Person[]> {
  const { data, error } = await supabase.from('people').select('*').order('sort')
  if (error) throw error
  return (data ?? []).map(mapPerson)
}

export async function getPersonById(id: string): Promise<Person | null> {
  const { data, error } = await supabase.from('people').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapPerson(data) : null
}

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabase.from('projects').select('*').order('sort')
  if (error) throw error
  return (data ?? []).map(mapProject)
}

export async function getProjectById(id: string): Promise<Project | null> {
  const { data, error } = await supabase.from('projects').select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ? mapProject(data) : null
}

export async function getReversaNow(): Promise<ReversaNowItem[]> {
  const { data, error } = await supabase.from('reversa_now').select('*').order('sort')
  if (error) throw error
  return (data ?? []).map((r: any) => ({
    id: r.id,
    category: r.category,
    title: r.title,
    when: r.when_label ?? '',
  }))
}
