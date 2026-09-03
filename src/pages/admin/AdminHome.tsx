import { Link, useNavigate } from 'react-router-dom'
import {
  Newspaper, FileText, BarChart3, Wrench, Briefcase, Users, FolderKanban,
  KeyRound, LogOut, ExternalLink, ChevronRight, ShieldCheck, MapPin, Building2, SlidersHorizontal, HelpCircle, Eye, Megaphone, BookOpen,
} from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { useAuth } from '@/lib/auth'
import { COLLECTION_LIST } from '@/data/admin'

const ICONS: Record<string, typeof FileText> = {
  news: FileText,
  pops: FileText,
  dashboards: BarChart3,
  tools: Wrench,
  jobs: Briefcase,
  people: Users,
  projects: FolderKanban,
  reversa_now: Megaphone,
}

const DESCRIPTIONS: Record<string, string> = {
  news: 'Matérias do portal (página Novidades)',
  pops: 'Procedimentos operacionais (página POP)',
  dashboards: 'Indicadores e painéis (página Dados)',
  tools: 'Ferramentas (página SPX Reverser)',
  jobs: 'Oportunidades (página Vagas)',
  people: 'Organograma (página Time)',
  projects: 'Projetos em andamento (Dados / Home)',
  reversa_now: 'Mural "Reversa Agora" da Home',
}

export default function AdminHome() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()

  return (
    <>
      <PageHeader
        eyebrow="Painel Administrativo"
        title="Gerenciar conteúdo"
        subtitle={`Logado como ${profile?.email}. Edite e adicione conteúdo em todas as páginas do portal.`}
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Admin' }]}
        actions={
          <>
            <Link to="/admin/senha" className="btn-ghost"><KeyRound size={15} /> Trocar senha</Link>
            <button onClick={async () => { await signOut(); navigate('/') }} className="btn-ghost">
              <LogOut size={15} /> Sair
            </button>
          </>
        }
      />

      <div className="portal-container py-6">
        {/* Jornal em destaque */}
        <Link
          to="/admin/edicoes"
          className="card group mb-6 flex items-center justify-between gap-4 border-l-4 border-l-orange p-5 transition-shadow hover:shadow-card-hover"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 items-center justify-center rounded-lg bg-dark text-orange">
              <Newspaper size={24} />
            </span>
            <div>
              <h2 className="text-lg font-bold text-ink group-hover:text-orange">Jornal Reversa — Edições</h2>
              <p className="text-sm text-ink-secondary">Crie, edite, publique e agende as edições do jornal.</p>
            </div>
          </div>
          <ChevronRight size={20} className="text-ink-muted transition-transform group-hover:translate-x-1" />
        </Link>

        <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Conteúdo das páginas</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {COLLECTION_LIST.map((c) => {
            const Icon = ICONS[c.key] ?? FileText
            return (
              <Link
                key={c.key}
                to={`/admin/colecao/${c.key}`}
                className="card group flex items-start gap-3 p-5 transition-shadow hover:shadow-card-hover"
              >
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-light text-orange">
                  <Icon size={19} />
                </span>
                <div className="min-w-0 flex-1">
                  <h4 className="text-base font-bold text-ink group-hover:text-orange">{c.label}</h4>
                  <p className="mt-0.5 text-xs text-ink-secondary">{DESCRIPTIONS[c.key]}</p>
                </div>
                <ChevronRight size={18} className="mt-1 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1" />
              </Link>
            )
          })}
        </div>

        {/* Acessos e localidades */}
        <h3 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-ink">Acessos e localidades</h3>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { to: '/admin/quiz', icon: HelpCircle, label: 'Quiz', desc: 'Criar quiz da semana e ver resultados por operação' },
            { to: '/admin/acessos', icon: ShieldCheck, label: 'Aprovação de acessos', desc: 'Aprovar ou recusar pedidos de acesso ao portal' },
            { to: '/admin/colecao/operations', icon: Building2, label: 'Operações', desc: 'Incluir ou excluir operações' },
            { to: '/admin/colecao/localities', icon: MapPin, label: 'Localidades', desc: 'Incluir ou excluir localidades' },
            { to: '/admin/abas', icon: Eye, label: 'Abas do menu', desc: 'Habilitar ou desabilitar as abas da navegação' },
            { to: '/admin/config', icon: SlidersHorizontal, label: 'Configurações', desc: 'Links do SPX Reverser e das Vagas' },
          ].map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="card group flex items-start gap-3 p-5 transition-shadow hover:shadow-card-hover">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-orange-light text-orange">
                <Icon size={19} />
              </span>
              <div className="min-w-0 flex-1">
                <h4 className="text-base font-bold text-ink group-hover:text-orange">{label}</h4>
                <p className="mt-0.5 text-xs text-ink-secondary">{desc}</p>
              </div>
              <ChevronRight size={18} className="mt-1 shrink-0 text-ink-muted transition-transform group-hover:translate-x-1" />
            </Link>
          ))}
        </div>

        {/* Documentação técnica */}
        <h3 className="mb-3 mt-8 text-sm font-bold uppercase tracking-wide text-ink">Documentação</h3>
        <a
          href="/arquitetura.html"
          target="_blank"
          rel="noopener noreferrer"
          className="card group flex items-center justify-between gap-4 border-l-4 border-l-orange p-5 transition-shadow hover:shadow-card-hover"
        >
          <div className="flex items-center gap-4">
            <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-lg bg-dark text-orange">
              <BookOpen size={22} />
            </span>
            <div>
              <h4 className="text-base font-bold text-ink group-hover:text-orange">Arquitetura do portal</h4>
              <p className="text-sm text-ink-secondary">Documento técnico ponta a ponta: tecnologia, dados, segurança e 2FA.</p>
            </div>
          </div>
          <ExternalLink size={18} className="shrink-0 text-ink-muted" />
        </a>

        <div className="mt-8 text-center">
          <Link to="/" className="link-arrow justify-center">
            Ver portal público <ExternalLink size={13} />
          </Link>
        </div>
      </div>
    </>
  )
}
