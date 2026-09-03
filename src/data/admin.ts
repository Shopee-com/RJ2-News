import { supabase } from '@/lib/supabase'
import { NEWS_CATEGORIES } from '@/data/news'
import { POP_CATEGORIES } from '@/data/pops'
import { TOOL_CATEGORIES, DASHBOARD_CATEGORIES } from '@/data/misc'
import { PEOPLE_LEVELS } from '@/data/people'

/* eslint-disable @typescript-eslint/no-explicit-any */

export type FieldType =
  | 'text'
  | 'textarea'
  | 'number'
  | 'image'
  | 'select'
  | 'boolean'
  | 'list'
  | 'date'
  | 'datetime'

export interface FieldConfig {
  name: string
  label: string
  type: FieldType
  options?: string[]
  full?: boolean
  help?: string
}

export interface CollectionConfig {
  key: string
  table: string
  label: string
  singular: string
  display: string // coluna usada como título na lista
  fields: FieldConfig[]
  defaults: () => Record<string, any>
}

const noAll = (arr: readonly string[]) => arr.filter((c) => c !== 'Todos')

export const COLLECTIONS: Record<string, CollectionConfig> = {
  news: {
    key: 'news',
    table: 'news',
    label: 'Notícias',
    singular: 'notícia',
    display: 'title',
    fields: [
      { name: 'title', label: 'Título', type: 'text', full: true },
      { name: 'slug', label: 'Slug (endereço)', type: 'text', help: 'Sem espaços. Ex.: nova-noticia' },
      { name: 'category', label: 'Categoria', type: 'select', options: noAll(NEWS_CATEGORIES) },
      { name: 'excerpt', label: 'Resumo', type: 'textarea', full: true },
      { name: 'image', label: 'Imagem (URL)', type: 'image', full: true },
      { name: 'content', label: 'Parágrafos', type: 'list', full: true },
      { name: 'author', label: 'Autor', type: 'text' },
      { name: 'author_role', label: 'Área do autor', type: 'text' },
      { name: 'reading_minutes', label: 'Min. de leitura', type: 'number' },
      { name: 'views', label: 'Visualizações', type: 'number' },
      { name: 'featured', label: 'Matéria destaque', type: 'boolean' },
      { name: 'status', label: 'Status', type: 'select', options: ['draft', 'scheduled', 'published'] },
      { name: 'publish_at', label: 'Publicar em', type: 'datetime' },
      { name: 'sort', label: 'Ordem', type: 'number' },
    ],
    defaults: () => ({
      title: 'Nova notícia',
      slug: `nova-noticia-${Date.now()}`,
      category: 'Operação',
      excerpt: '',
      image: '',
      content: [''],
      author: '',
      author_role: '',
      reading_minutes: 3,
      views: 0,
      featured: false,
      status: 'draft',
      publish_at: new Date().toISOString(),
      sort: 0,
    }),
  },
  pops: {
    key: 'pops',
    table: 'pops',
    label: 'POPs',
    singular: 'POP',
    display: 'name',
    fields: [
      { name: 'code', label: 'Código', type: 'text' },
      { name: 'name', label: 'Nome', type: 'text' },
      { name: 'category', label: 'Categoria', type: 'select', options: noAll(POP_CATEGORIES) },
      { name: 'version', label: 'Versão', type: 'text' },
      { name: 'owner', label: 'Responsável', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['Vigente', 'Em revisão', 'Arquivado'] },
      { name: 'summary', label: 'Resumo', type: 'textarea', full: true },
      { name: 'steps', label: 'Etapas', type: 'list', full: true },
      { name: 'download_url', label: 'Link de download (botão "Baixar")', type: 'text', full: true, help: 'Cole o link do documento (Drive, PDF, etc.). Deixe em branco para ocultar o botão.' },
      { name: 'doc_updated', label: 'Atualizado em', type: 'date' },
      { name: 'published', label: 'Publicado', type: 'boolean' },
      { name: 'sort', label: 'Ordem', type: 'number' },
    ],
    defaults: () => ({
      code: 'POP 000', name: 'Novo procedimento', category: 'Triagem', version: 'v1.0',
      owner: '', status: 'Vigente', summary: '', steps: [''], download_url: '',
      doc_updated: new Date().toISOString().slice(0, 10), published: true, sort: 0,
    }),
  },
  dashboards: {
    key: 'dashboards',
    table: 'dashboards',
    label: 'Dashboards',
    singular: 'dashboard',
    display: 'name',
    fields: [
      { name: 'name', label: 'Nome', type: 'text' },
      { name: 'category', label: 'Categoria', type: 'select', options: noAll(DASHBOARD_CATEGORIES) },
      { name: 'description', label: 'Descrição', type: 'textarea', full: true },
      { name: 'owner', label: 'Responsável', type: 'text' },
      { name: 'provider', label: 'Fonte', type: 'select', options: ['Looker Studio', 'Power BI', 'Google Sheets', 'Sistema Interno'] },
      { name: 'href', label: 'Link', type: 'text', full: true },
      { name: 'doc_updated', label: 'Atualizado em', type: 'date' },
      { name: 'published', label: 'Publicado', type: 'boolean' },
      { name: 'sort', label: 'Ordem', type: 'number' },
    ],
    defaults: () => ({
      name: 'Novo dashboard', category: 'Performance', description: '', owner: '',
      provider: 'Looker Studio', href: '#', doc_updated: new Date().toISOString().slice(0, 10),
      published: true, sort: 0,
    }),
  },
  tools: {
    key: 'tools',
    table: 'tools',
    label: 'Ferramentas',
    singular: 'ferramenta',
    display: 'name',
    fields: [
      { name: 'name', label: 'Nome', type: 'text' },
      { name: 'category', label: 'Categoria', type: 'select', options: noAll(TOOL_CATEGORIES) },
      { name: 'description', label: 'Descrição', type: 'textarea', full: true },
      { name: 'owner', label: 'Responsável', type: 'text' },
      { name: 'version', label: 'Versão', type: 'text' },
      { name: 'href', label: 'Link', type: 'text', full: true },
      { name: 'published', label: 'Publicado', type: 'boolean' },
      { name: 'sort', label: 'Ordem', type: 'number' },
    ],
    defaults: () => ({
      name: 'Nova ferramenta', category: 'Ferramentas', description: '', owner: '',
      version: 'v1.0', href: '#', published: true, sort: 0,
    }),
  },
  jobs: {
    key: 'jobs',
    table: 'jobs',
    label: 'Vagas',
    singular: 'vaga',
    display: 'title',
    fields: [
      { name: 'title', label: 'Título', type: 'text', full: true },
      { name: 'area', label: 'Área', type: 'text' },
      { name: 'location', label: 'Local', type: 'text' },
      { name: 'model', label: 'Modelo', type: 'select', options: ['Presencial', 'Híbrido', 'Remoto'] },
      { name: 'shift', label: 'Turno', type: 'text' },
      { name: 'region', label: 'Região', type: 'text' },
      { name: 'summary', label: 'Descrição', type: 'textarea', full: true },
      { name: 'apply_url', label: 'Link "Candidatar-se"', type: 'text', full: true, help: 'Deixe em branco para usar o link padrão das Configurações' },
      { name: 'posted_at', label: 'Publicada em', type: 'date' },
      { name: 'published', label: 'Publicada', type: 'boolean' },
      { name: 'sort', label: 'Ordem', type: 'number' },
    ],
    defaults: () => ({
      title: 'Nova vaga', area: '', location: '', model: 'Presencial', shift: '',
      region: 'REG 1', summary: '', apply_url: '', posted_at: new Date().toISOString().slice(0, 10),
      published: true, sort: 0,
    }),
  },
  people: {
    key: 'people',
    table: 'people',
    label: 'Pessoas',
    singular: 'pessoa',
    display: 'name',
    fields: [
      { name: 'name', label: 'Nome', type: 'text' },
      { name: 'role', label: 'Cargo', type: 'text' },
      { name: 'region', label: 'Região', type: 'select', options: ['REG 1', 'REG 2', 'FULL', 'CROSS-BORDER'] },
      { name: 'shift', label: 'Turno', type: 'text' },
      { name: 'contact', label: 'Contato (e-mail)', type: 'text' },
      { name: 'photo', label: 'Foto (URL)', type: 'image', full: true },
      { name: 'level', label: 'Cargo / nível', type: 'select', options: PEOPLE_LEVELS },
      { name: 'quote', label: 'Depoimento', type: 'textarea', full: true },
      { name: 'published', label: 'Publicado', type: 'boolean' },
      { name: 'sort', label: 'Ordem', type: 'number' },
    ],
    defaults: () => ({
      name: 'Nova pessoa', role: '', region: 'REG 1', shift: '', contact: '', photo: '',
      level: 'Analista', quote: '', published: true, sort: 0,
    }),
  },
  projects: {
    key: 'projects',
    table: 'projects',
    label: 'Projetos',
    singular: 'projeto',
    display: 'name',
    fields: [
      { name: 'name', label: 'Nome', type: 'text', full: true },
      { name: 'progress', label: 'Progresso (%)', type: 'number' },
      { name: 'owner', label: 'Responsável', type: 'text' },
      { name: 'status', label: 'Status', type: 'select', options: ['No prazo', 'Atenção', 'Atrasado', 'Concluído'] },
      { name: 'deadline', label: 'Prazo', type: 'date' },
      { name: 'last_update', label: 'Última atualização', type: 'date' },
      { name: 'published', label: 'Publicado', type: 'boolean' },
      { name: 'sort', label: 'Ordem', type: 'number' },
    ],
    defaults: () => ({
      name: 'Novo projeto', progress: 0, owner: '', status: 'No prazo',
      deadline: new Date().toISOString().slice(0, 10),
      last_update: new Date().toISOString().slice(0, 10), published: true, sort: 0,
    }),
  },
  reversa_now: {
    key: 'reversa_now',
    table: 'reversa_now',
    label: 'Reversa Agora',
    singular: 'item',
    display: 'title',
    fields: [
      { name: 'category', label: 'Categoria', type: 'select', options: ['Comunicado', 'Treinamento', 'Atualização', 'Reconhecimento'] },
      { name: 'title', label: 'Título', type: 'text', full: true },
      { name: 'when_label', label: 'Quando', type: 'text', help: 'Texto livre. Ex.: Hoje • 10h30' },
      { name: 'published', label: 'Publicado', type: 'boolean' },
      { name: 'sort', label: 'Ordem', type: 'number' },
    ],
    defaults: () => ({
      category: 'Comunicado', title: 'Novo item', when_label: 'Hoje • 00h00',
      published: true, sort: 0,
    }),
  },
  // ---- Acessos / localidades ----
  operations: {
    key: 'operations',
    table: 'operations',
    label: 'Operações',
    singular: 'operação',
    display: 'name',
    fields: [
      { name: 'name', label: 'Nome da operação', type: 'text', full: true },
      { name: 'sort', label: 'Ordem', type: 'number' },
    ],
    defaults: () => ({ name: 'Nova operação', sort: 0 }),
  },
  localities: {
    key: 'localities',
    table: 'localities',
    label: 'Localidades',
    singular: 'localidade',
    display: 'name',
    fields: [
      { name: 'name', label: 'Nome da localidade', type: 'text', full: true },
      { name: 'operation', label: 'Operação', type: 'text', help: 'Deve corresponder ao nome de uma operação (ex.: REG 1)' },
      { name: 'sort', label: 'Ordem', type: 'number' },
    ],
    defaults: () => ({ name: 'Nova localidade', operation: '', sort: 0 }),
  },
}

// Coleções de conteúdo mostradas no hub (exclui acessos/localidades)
const CONTENT_KEYS = ['news', 'pops', 'dashboards', 'tools', 'jobs', 'people', 'projects', 'reversa_now']
export const COLLECTION_LIST = CONTENT_KEYS.map((k) => COLLECTIONS[k])

// ---------------------------------------------------------------------------
// CRUD genérico
// ---------------------------------------------------------------------------
export async function adminFetchAll(table: string): Promise<any[]> {
  const { data, error } = await supabase.from(table).select('*').order('sort', { ascending: true })
  if (error) throw error
  return data ?? []
}

export async function adminFetchOne(table: string, id: string): Promise<any | null> {
  const { data, error } = await supabase.from(table).select('*').eq('id', id).maybeSingle()
  if (error) throw error
  return data ?? null
}

export async function adminCreate(table: string, row: Record<string, any>): Promise<any> {
  const { data, error } = await supabase.from(table).insert(row).select().single()
  if (error) throw error
  return data
}

export async function adminUpdate(table: string, id: string, patch: Record<string, any>): Promise<any> {
  // remove colunas de controle que não devem ser reescritas
  const { id: _omit, created_at, updated_at, ...clean } = patch
  void _omit
  void created_at
  void updated_at
  const { data, error } = await supabase.from(table).update(clean).eq('id', id).select().single()
  if (error) throw error
  return data
}

export async function adminDelete(table: string, id: string): Promise<void> {
  const { error } = await supabase.from(table).delete().eq('id', id)
  if (error) throw error
}
