import type {
  AgendaEvent,
  Announcement,
  Notification,
  Dashboard,
  Tool,
  Job,
  Kpi,
  QuickLink,
} from '@/types'

// ---------------------------------------------------------------------------
// Reversa Agora (dark card on the home hero row)
// ---------------------------------------------------------------------------
export interface ReversaNowItem {
  id: string
  category: 'Comunicado' | 'Treinamento' | 'Atualização' | 'Reconhecimento'
  title: string
  when: string
}

export const reversaNow: ReversaNowItem[] = [
  {
    id: 'rn1',
    category: 'Comunicado',
    title: 'Novo procedimento de liberação de aparas',
    when: 'Hoje • 10h30',
  },
  {
    id: 'rn2',
    category: 'Treinamento',
    title: 'Treinamento: Novo fluxo de devoluções',
    when: 'Hoje • 14h00',
  },
  {
    id: 'rn3',
    category: 'Atualização',
    title: 'Mudança no processo de etiquetagem reversa',
    when: 'Ontem • 16h45',
  },
  {
    id: 'rn4',
    category: 'Reconhecimento',
    title: 'Parabéns ao time RJ2 pelo resultado da semana!',
    when: 'Ontem • 18h15',
  },
]

// ---------------------------------------------------------------------------
// Agenda
// ---------------------------------------------------------------------------
export const agenda: AgendaEvent[] = [
  {
    id: 'ev1',
    day: '28',
    month: 'MAI',
    title: 'Treinamento: Novo Fluxo de Devoluções',
    mode: 'Online',
    time: '14h00',
  },
  {
    id: 'ev2',
    day: '02',
    month: 'JUN',
    title: 'SIPAT Reversa 2026',
    mode: 'Presencial',
    time: '09h00',
  },
  {
    id: 'ev3',
    day: '05',
    month: 'JUN',
    title: 'Boas Práticas na Expedição Reversa',
    mode: 'Online',
    time: '15h00',
  },
  {
    id: 'ev4',
    day: '11',
    month: 'JUN',
    title: 'Workshop de Prevenção de Perdas',
    mode: 'Presencial',
    time: '10h00',
  },
]

// ---------------------------------------------------------------------------
// Comunicados
// ---------------------------------------------------------------------------
export const announcements: Announcement[] = [
  { id: 'an1', text: 'Atualização do procedimento de aparas e avarias' },
  { id: 'an2', text: 'Novo canal de comunicação da Reversa' },
  { id: 'an3', text: 'Campanha do Agasalho 2026 — Participe!' },
  { id: 'an4', text: 'Resultado da pesquisa de clima — Reversa RJ2' },
]

// ---------------------------------------------------------------------------
// Notificações
// ---------------------------------------------------------------------------
export const notifications: Notification[] = [
  { id: 'nt1', type: 'Novo POP', title: 'POP 002 — Triagem atualizado para v2.3', time: 'Há 2h', read: false },
  { id: 'nt2', type: 'Comunicado', title: 'Novo procedimento de liberação de aparas', time: 'Há 4h', read: false },
  { id: 'nt3', type: 'Treinamento', title: 'Inscrições abertas: Novo Fluxo de Devoluções', time: 'Hoje', read: false },
  { id: 'nt4', type: 'Reconhecimento', title: 'Time RJ2 é destaque da semana', time: 'Ontem', read: true },
  { id: 'nt5', type: 'Projeto', title: 'Automação da Triagem chegou a 75%', time: 'Ontem', read: true },
  { id: 'nt6', type: 'Atualização', title: 'Mudança no processo de etiquetagem reversa', time: '2 dias', read: true },
]

// ---------------------------------------------------------------------------
// Dashboards (Dados)
// ---------------------------------------------------------------------------
export const DASHBOARD_CATEGORIES = [
  'Todos',
  'Performance',
  'Produtividade',
  'Loss',
  'ABS',
  'Backlog',
  'EHA',
  'Inbound',
  'Outbound',
  'Auditorias',
]

export const dashboards: Dashboard[] = [
  { id: 'd1', name: 'Performance Reversa', category: 'Performance', description: 'Visão geral de performance da operação reversa por regional e turno.', owner: 'BI Reversa', updatedAt: '2026-05-26', provider: 'Looker Studio', href: '#' },
  { id: 'd2', name: 'Produtividade', category: 'Produtividade', description: 'Produtividade por hora (pph), por estação e por colaborador.', owner: 'BI Reversa', updatedAt: '2026-05-26', provider: 'Power BI', href: '#' },
  { id: 'd3', name: 'ABS', category: 'ABS', description: 'Acompanhamento do indicador de absenteísmo por regional.', owner: 'Pessoas', updatedAt: '2026-05-25', provider: 'Google Sheets', href: '#' },
  { id: 'd4', name: 'Loss & Damage', category: 'Loss', description: 'Perdas e avarias com abertura por causa raiz e valor.', owner: 'Prevenção de Perdas', updatedAt: '2026-05-25', provider: 'Looker Studio', href: '#' },
  { id: 'd5', name: 'Auditoria', category: 'Auditorias', description: 'Resultados de auditoria por etapa e plano de ação.', owner: 'Auditoria Interna', updatedAt: '2026-05-22', provider: 'Sistema Interno', href: '#' },
  { id: 'd6', name: 'Stage In', category: 'Inbound', description: 'Tempo e volume de entrada de cargas reversas.', owner: 'Coordenação Inbound', updatedAt: '2026-05-24', provider: 'Power BI', href: '#' },
  { id: 'd7', name: 'EHA', category: 'EHA', description: 'Avaliação de estado dos produtos e taxa de recuperação.', owner: 'Coordenação EHA', updatedAt: '2026-05-23', provider: 'Looker Studio', href: '#' },
  { id: 'd8', name: 'Backlog', category: 'Backlog', description: 'Backlog por etapa da jornada e envelhecimento.', owner: 'PMO Reversa', updatedAt: '2026-05-26', provider: 'Google Sheets', href: '#' },
]

// ---------------------------------------------------------------------------
// Ferramentas (SPX Reverser)
// ---------------------------------------------------------------------------
export const TOOL_CATEGORIES = [
  'Todos',
  'Ferramentas',
  'Calculadoras',
  'Planilhas',
  'Apps',
  'Automação',
  'Materiais',
]

export const tools: Tool[] = [
  { id: 't1', name: 'Gerador de Relatório', category: 'Ferramentas', description: 'Gera relatórios operacionais padronizados da Reversa.', owner: 'BI Reversa', version: 'v2.1', href: '#' },
  { id: 't2', name: 'Controle de Ativos', category: 'Planilhas', description: 'Controle de gaiolas, paletes e ativos da operação.', owner: 'Coordenação Inbound', version: 'v1.6', href: '#' },
  { id: 't3', name: 'Controle ABS', category: 'Calculadoras', description: 'Calcula e acompanha o indicador de absenteísmo.', owner: 'Pessoas', version: 'v1.2', href: '#' },
  { id: 't4', name: 'Produtividade', category: 'Calculadoras', description: 'Calculadora de produtividade por hora e por estação.', owner: 'BI Reversa', version: 'v1.9', href: '#' },
  { id: 't5', name: 'BR Recovery', category: 'Apps', description: 'Aplicativo de apoio à recuperação de produtos.', owner: 'Coordenação EHA', version: 'v3.0', href: '#' },
  { id: 't6', name: 'Auditoria', category: 'Ferramentas', description: 'Checklist digital de auditoria de processos.', owner: 'Auditoria Interna', version: 'v2.0', href: '#' },
  { id: 't7', name: 'Stage In', category: 'Automação', description: 'Automação de registro de entrada de cargas.', owner: 'Coordenação Inbound', version: 'v1.4', href: '#' },
  { id: 't8', name: 'Prioridade de Gaiolas', category: 'Ferramentas', description: 'Define a ordem de processamento das gaiolas.', owner: 'Qualidade Reversa', version: 'v1.1', href: '#' },
]

// ---------------------------------------------------------------------------
// Vagas
// ---------------------------------------------------------------------------
export const jobs: Job[] = [
  { id: 'v1', title: 'Analista de Logística', area: 'Reversa', location: 'Rio de Janeiro — RJ', model: 'Presencial', shift: 'Comercial', region: 'REG 2', postedAt: '2026-05-24', summary: 'Responsável por indicadores, processos e melhoria contínua da operação reversa.' },
  { id: 'v2', title: 'Assistente de Operações', area: 'Operação', location: 'São Paulo — SP', model: 'Presencial', shift: 'Noite', region: 'REG 1', postedAt: '2026-05-22', summary: 'Apoio às atividades de triagem, conferência e expedição reversa.' },
  { id: 'v3', title: 'Líder de Operação', area: 'Operação', location: 'Extrema — MG', model: 'Presencial', shift: 'Tarde', region: 'FULL', postedAt: '2026-05-20', summary: 'Gestão de equipe operacional, indicadores e comunicação entre turnos.' },
  { id: 'v4', title: 'Analista de Performance', area: 'BI', location: 'Remoto', model: 'Remoto', shift: 'Comercial', region: 'CROSS-BORDER', postedAt: '2026-05-18', summary: 'Construção de dashboards e análise de indicadores da Reversa.' },
  { id: 'v5', title: 'Coordenador de Qualidade', area: 'Qualidade', location: 'Rio de Janeiro — RJ', model: 'Híbrido', shift: 'Comercial', region: 'REG 2', postedAt: '2026-05-15', summary: 'Coordenação de POPs, auditorias e cultura de acurácia.' },
]

export function getJobById(id: string): Job | undefined {
  return jobs.find((j) => j.id === id)
}

// ---------------------------------------------------------------------------
// KPIs (Desempenho geral — home)
// ---------------------------------------------------------------------------
export const kpis: Kpi[] = [
  { id: 'k1', label: 'ABS', value: '4,70%', target: 'Meta: 5,30%', delta: '-0,60 p.p.', trend: 'down-good' },
  { id: 'k2', label: 'LOSS', value: '0,09%', target: 'Meta: 0,20%', delta: '-0,11 p.p.', trend: 'down-good' },
  { id: 'k3', label: 'PRODUTIVIDADE', value: '7.111', target: 'Meta: 7.200 pph', delta: '-1,23%', trend: 'up-good' },
  { id: 'k4', label: 'SLA', value: '98,4%', target: 'Meta: 97,0%', delta: '+1,40 p.p.', trend: 'up-good' },
]

// ---------------------------------------------------------------------------
// Quick links
// ---------------------------------------------------------------------------
export const quickLinks: QuickLink[] = [
  { id: 'q1', label: 'Procedimentos', icon: 'FileText' },
  { id: 'q2', label: 'Dashboards', icon: 'BarChart3' },
  { id: 'q3', label: 'Forms', icon: 'ClipboardList' },
  { id: 'q4', label: 'Contatos', icon: 'Users' },
]

// ---------------------------------------------------------------------------
// Modelo da semana
// ---------------------------------------------------------------------------
export const weekModel = {
  team: 'RJ2',
  focus: 'ACURÁCIA E AGILIDADE',
  checklist: [
    'Separação dentro do SLA',
    'Etiquetas e lacres validados',
    'Conferência dupla realizada',
    'Registro de exceções',
    'Comunicação ativa',
  ],
  message: 'Parabéns ao time RJ2 pelo exemplo de disciplina e resultado!',
}
