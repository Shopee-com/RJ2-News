import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Newspaper, ChevronDown, CheckCircle2, ClipboardCheck, ShieldCheck,
  Workflow, GraduationCap, MessageSquareQuote, Megaphone, ArrowRight, Eye, X,
  FileText, BarChart3, ClipboardList, Users, Sparkles, Maximize2,
} from 'lucide-react'
import { fetchPublishedEditions, type Edition, type EditionFeature } from '@/data/editions'
import { formatDateShort, formatDateLong } from '@/lib/format'

export default function JornalReversa() {
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [currentId, setCurrentId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [reading, setReading] = useState(false)
  const [bpOpen, setBpOpen] = useState(false)
  const [feature, setFeature] = useState<{ section: string; data: EditionFeature } | null>(null)

  useEffect(() => {
    fetchPublishedEditions()
      .then((eds) => {
        setEditions(eds)
        setCurrentId(eds[0]?.id ?? null)
      })
      .catch((e) => setError(e.message ?? 'Erro ao carregar edições.'))
      .finally(() => setLoading(false))
  }, [])

  const current = useMemo(
    () => editions.find((e) => e.id === currentId) ?? editions[0],
    [editions, currentId],
  )

  if (loading) return <LoadingState />
  if (error)
    return (
      <div className="portal-container py-16 text-center">
        <p className="text-sm text-danger">Não foi possível carregar o jornal: {error}</p>
      </div>
    )
  if (!current)
    return (
      <div className="portal-container py-16 text-center">
        <Newspaper className="mx-auto mb-3 text-ink-muted" size={32} />
        <p className="text-sm text-ink-secondary">Nenhuma edição publicada ainda.</p>
        <Link to="/admin" className="link-arrow mt-3 justify-center">
          Ir para o painel <ArrowRight size={14} />
        </Link>
      </div>
    )

  return (
    <div className="portal-container py-5">
      {/* Masthead */}
      <header className="mb-5 flex flex-col gap-4 border-b-2 border-dark pb-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-lg border-2 border-orange text-orange">
            <Newspaper size={24} />
          </span>
          <div>
            <h1 className="text-3xl font-extrabold uppercase leading-none tracking-tight sm:text-4xl">
              <span className="text-dark">JORNAL</span> <span className="text-orange">REVERSA</span>
            </h1>
            <p className="mt-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-muted">
              Informação que transforma. Resultados que conectam.
            </p>
          </div>
        </div>

        {/* Seletor de edição */}
        <div className="relative">
          <button
            onClick={() => setPickerOpen((v) => !v)}
            className="flex w-full items-center justify-between gap-4 rounded-lg border border-line bg-white px-4 py-2.5 text-left shadow-card sm:w-72"
          >
            <span>
              <span className="block text-[11px] uppercase tracking-wide text-ink-muted">Edição Atual</span>
              <span className="block text-sm font-bold text-ink">
                Edição #{current.number} · {formatDateLong(current.edition_date)}
              </span>
            </span>
            <ChevronDown size={18} className={`text-ink-muted transition-transform ${pickerOpen ? 'rotate-180' : ''}`} />
          </button>
          {pickerOpen && (
            <>
              <div className="fixed inset-0 z-20" onClick={() => setPickerOpen(false)} />
              <div className="absolute right-0 z-30 mt-1 w-full overflow-hidden rounded-lg border border-line bg-white shadow-panel sm:w-72">
                {editions.map((e) => (
                  <button
                    key={e.id}
                    onClick={() => { setCurrentId(e.id); setPickerOpen(false) }}
                    className={`flex w-full items-center justify-between px-4 py-2.5 text-left text-sm hover:bg-orange-light ${
                      e.id === current.id ? 'bg-orange-light font-semibold text-orange' : 'text-ink'
                    }`}
                  >
                    <span>Edição #{e.number}</span>
                    <span className="text-xs text-ink-muted">{formatDateShort(e.edition_date)}</span>
                  </button>
                ))}
              </div>
            </>
          )}
        </div>
      </header>

      {/* Linha 1 — Entrevista principal + Entrevista da semana + Últimas edições */}
      <section className="grid gap-4 lg:grid-cols-12">
        {/* Entrevista principal */}
        <div className="lg:col-span-5">
          <div className="relative h-full min-h-[340px] overflow-hidden rounded-card bg-dark">
            <img
              src={current.hero.image}
              alt=""
              className="absolute inset-0 h-full w-full object-cover opacity-70"
              style={{ objectPosition: `center ${current.hero.pos ?? 50}%` }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-dark via-dark/80 to-dark/20" />
            <div className="relative flex h-full flex-col justify-end p-6">
              <span className="label-chip mb-2 w-fit rounded bg-orange px-2 py-1 text-white">Entrevista principal</span>
              <h2 className="text-2xl font-extrabold leading-tight text-white sm:text-3xl">{current.hero.title}</h2>
              <p className="mt-2 max-w-md text-sm text-on-dark-secondary">{current.hero.subtitle}</p>
              <button onClick={() => setReading(true)} className="btn-primary mt-4 w-fit">
                {current.hero.cta_label || 'Ler entrevista completa'} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        </div>

        {/* Entrevista da semana */}
        <div className="lg:col-span-4">
          <div className="card flex h-full flex-col p-5">
            <div className="mb-3 flex items-center gap-2">
              <MessageSquareQuote size={16} className="text-orange" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Dica da Gestão</h3>
            </div>

            <div className="flex gap-4">
              <img
                src={current.interview.photo}
                alt={current.interview.name}
                className="h-28 w-24 shrink-0 rounded-xl object-cover ring-2 ring-orange-light"
                style={{ objectPosition: `center ${current.interview.pos ?? 50}%` }}
              />
              <div className="min-w-0 self-center">
                <h4 className="text-base font-bold leading-tight text-ink">{current.interview.name}</h4>
                <p className="text-xs text-orange">{current.interview.role}</p>
                {current.interview.quote && (
                  <p className="mt-2 text-sm italic leading-snug text-ink-secondary">“{current.interview.quote}”</p>
                )}
              </div>
            </div>

            {current.interview.highlight && (
              <div className="mt-4 flex-1 rounded-lg bg-orange-light p-4">
                <div className="mb-2 flex items-center gap-1 text-xs font-bold uppercase text-orange">
                  <Sparkles size={13} /> Destaque
                </div>
                <div className="space-y-2">{renderParagraphs(current.interview.highlight)}</div>
              </div>
            )}
          </div>
        </div>

        {/* Últimas edições */}
        <div className="lg:col-span-3">
          <div className="card flex h-full flex-col p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Últimas Edições</h3>
            <ul className="flex-1 space-y-3">
              {editions.slice(0, 4).map((e) => (
                <li key={e.id}>
                  <button onClick={() => setCurrentId(e.id)} className="flex w-full items-start gap-3 text-left">
                    <span className="relative h-16 w-12 shrink-0 overflow-hidden rounded border border-line">
                      <img src={e.hero.image} alt="" className="h-full w-full object-cover" />
                    </span>
                    <span className="min-w-0">
                      <span className="text-xs font-bold text-orange">#{e.number}</span>
                      <span className="block text-[11px] text-ink-muted">{formatDateShort(e.edition_date)}</span>
                      <span className="line-clamp-2 text-xs font-medium text-ink">{e.hero.title}</span>
                      <span className="mt-0.5 flex items-center gap-1 text-[11px] text-ink-muted"><Eye size={11} /> {e.views}</span>
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* Linha 2 — Boas práticas + Projetos + Calendário */}
      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {/* Boas práticas — clicável, abre em modal */}
        <button
          onClick={() => setBpOpen(true)}
          className="card group flex flex-col p-5 text-left transition-shadow duration-200 hover:border-orange hover:shadow-card-hover"
        >
          <div className="mb-3 flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <ClipboardCheck size={16} className="text-orange" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Boas Práticas de uma Operação</h3>
            </div>
            <Maximize2 size={14} className="shrink-0 text-ink-muted transition-colors group-hover:text-orange" />
          </div>
          <ul className="flex-1 space-y-2.5">
            {current.best_practices.items.filter(Boolean).slice(0, 5).map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-ink-secondary">
                <CheckCircle2 size={15} className="shrink-0 text-orange" /> <span className="line-clamp-1">{item}</span>
              </li>
            ))}
          </ul>
          {current.best_practices.tagline && (
            <p className="mt-3 text-sm font-bold text-orange">{current.best_practices.tagline}</p>
          )}
          <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-orange">
            Abrir <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
          </span>
        </button>

        {/* Projetos */}
        <div className="card flex flex-col p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Projetos em Andamento</h3>
          <ul className="flex-1 space-y-4">
            {current.projects.filter((p) => p.name).map((p) => (
              <li key={p.name}>
                <div className="mb-1 flex items-center justify-between text-sm">
                  <span className="font-medium text-ink">{p.name}</span>
                  <span className="font-bold text-ink">{p.progress}%</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-bg-secondary">
                  <div className="h-full rounded-full bg-orange" style={{ width: `${p.progress}%` }} />
                </div>
              </li>
            ))}
          </ul>
          <Link to="/dados" className="link-arrow mt-4">Ver todos os projetos →</Link>
        </div>

        {/* Processo — clicável, abre em modal */}
        <FeatureCard
          section="Processo"
          icon={Workflow}
          feature={current.processo}
          onOpen={() => setFeature({ section: 'Processo', data: current.processo })}
        />
      </section>

      {/* Olha o Treinamento Passando — banner clicável */}
      <section className="mt-4">
        <FeatureBanner
          section="Olha o Treinamento Passando"
          icon={GraduationCap}
          feature={current.treinamento}
          onOpen={() => setFeature({ section: 'Olha o Treinamento Passando', data: current.treinamento })}
        />
      </section>

      {/* Linha 3 — Regra de Ouro HSE (largo) + Comunicados + Links */}
      <section className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {/* Regra de Ouro HSE — texto + foto na lateral */}
        <div className="card flex flex-col p-5 md:col-span-2 xl:col-span-2">
          <div className="mb-3 flex items-center gap-2">
            <ShieldCheck size={16} className="text-orange" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Regra de Ouro HSE</h3>
          </div>

          <div className="flex flex-1 flex-col gap-4 sm:flex-row">
            {/* Foto lateral */}
            {current.golden_rules.image && (
              <div className="shrink-0 sm:w-44">
                <div className="h-40 overflow-hidden rounded-lg border border-line sm:h-full">
                  <img
                    src={current.golden_rules.image}
                    alt=""
                    className="h-full w-full object-cover"
                    style={{ objectPosition: `center ${current.golden_rules.pos ?? 50}%` }}
                  />
                </div>
              </div>
            )}

            {/* Texto */}
            <div className="min-w-0 flex-1">
              {current.golden_rules.body?.filter(Boolean).length
                ? renderRichText(current.golden_rules.body)
                : (
                  <ul className="space-y-2">
                    {current.golden_rules.items.filter(Boolean).map((item, i) => (
                      <li key={item} className="flex items-start gap-2 text-sm text-ink-secondary">
                        <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange text-[11px] font-bold text-white">
                          {i + 1}
                        </span>
                        {item}
                      </li>
                    ))}
                  </ul>
                )}
              {current.golden_rules.tagline && (
                <p className="mt-3 flex items-center gap-2 rounded-lg bg-orange-light p-3 text-sm font-bold text-orange">
                  <ShieldCheck size={16} /> {current.golden_rules.tagline}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Comunicados */}
        <div className="card flex flex-col p-5">
          <div className="mb-3 flex items-center gap-2">
            <Megaphone size={16} className="text-orange" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Comunicados Importantes</h3>
          </div>
          <ul className="flex-1 space-y-3">
            {current.announcements.filter(Boolean).map((a) => (
              <li key={a} className="flex items-start gap-2.5 text-sm text-ink-secondary">
                <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" /> {a}
              </li>
            ))}
          </ul>
        </div>

        {/* Links rápidos */}
        <div className="card flex flex-col p-5">
          <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Links Rápidos</h3>
          <div className="grid flex-1 grid-cols-2 gap-3">
            {[
              { icon: FileText, label: 'Procedimentos', to: '/pop' },
              { icon: BarChart3, label: 'Dashboards', to: '/dados' },
              { icon: ClipboardList, label: 'Forms', to: '/reverser' },
              { icon: Users, label: 'Contatos', to: '/time' },
            ].map(({ icon: Icon, label, to }) => (
              <Link key={label} to={to} className="group flex flex-col items-center justify-center gap-2 rounded-lg border border-line p-4 text-center transition-colors hover:border-orange">
                <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-light text-orange">
                  <Icon size={18} />
                </span>
                <span className="text-xs font-semibold text-ink group-hover:text-orange">{label}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* Modal de leitura da entrevista */}
      {reading && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-4 pt-[6vh] backdrop-blur-sm" onClick={() => setReading(false)}>
          <article className="w-full max-w-2xl overflow-hidden rounded-card bg-white shadow-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56">
              <img src={current.hero.image} alt="" className="h-full w-full object-cover" style={{ objectPosition: `center ${current.hero.pos ?? 50}%` }} />
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 to-transparent" />
              <button onClick={() => setReading(false)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white" aria-label="Fechar">
                <X size={16} />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="label-chip rounded bg-orange px-2 py-1 text-white">Edição #{current.number}</span>
                <h2 className="mt-2 text-2xl font-extrabold text-white">{current.hero.title}</h2>
              </div>
            </div>
            <div className="max-h-[50vh] space-y-3 overflow-y-auto p-6">
              <p className="text-base font-medium text-ink">{current.hero.subtitle}</p>
              {current.hero.body.filter(Boolean).map((p, i) => (
                <p key={i} className="leading-relaxed text-ink-secondary">{p}</p>
              ))}
            </div>
          </article>
        </div>
      )}

      {/* Modal — Boas Práticas de uma Operação */}
      {bpOpen && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-4 pt-[8vh] backdrop-blur-sm" onClick={() => setBpOpen(false)}>
          <article className="w-full max-w-lg overflow-hidden rounded-card bg-white shadow-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between border-b border-line px-6 py-4">
              <div className="flex items-center gap-2">
                <ClipboardCheck size={18} className="text-orange" />
                <h2 className="text-base font-bold text-ink">Boas Práticas de uma Operação</h2>
              </div>
              <button onClick={() => setBpOpen(false)} className="text-ink-muted hover:text-ink" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-6">
              <ul className="space-y-3">
                {current.best_practices.items.filter(Boolean).map((item, i) => (
                  <li key={item} className="flex items-start gap-3 text-sm text-ink">
                    <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-orange-light text-xs font-bold text-orange">
                      {i + 1}
                    </span>
                    <span className="leading-relaxed">{item}</span>
                  </li>
                ))}
              </ul>
              {current.best_practices.tagline && (
                <p className="mt-5 flex items-center gap-2 rounded-lg bg-orange-light p-3 text-sm font-bold text-orange">
                  <CheckCircle2 size={16} /> {current.best_practices.tagline}
                </p>
              )}
            </div>
          </article>
        </div>
      )}

      {/* Modal — Processo / Treinamento (mostra a foto inteira) */}
      {feature && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-4 pt-[5vh] backdrop-blur-sm" onClick={() => setFeature(null)}>
          <article className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-white shadow-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
            {/* Cabeçalho */}
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-3">
              <div className="flex min-w-0 items-center gap-2">
                <span className="label-chip rounded bg-orange px-2 py-1 text-white">{feature.section}</span>
                {feature.data.title && <h2 className="truncate text-base font-bold text-ink">{feature.data.title}</h2>}
              </div>
              <button onClick={() => setFeature(null)} className="shrink-0 text-ink-muted hover:text-ink" aria-label="Fechar">
                <X size={18} />
              </button>
            </div>

            {/* Foto inteira (sem cortar) */}
            {feature.data.image && (
              <div className="flex shrink-0 items-center justify-center bg-dark">
                <img src={feature.data.image} alt="" className="max-h-[55vh] w-full object-contain" />
              </div>
            )}

            {/* Texto */}
            <div className="flex-1 space-y-3 overflow-y-auto p-6">
              {feature.data.summary && <p className="text-base font-medium text-ink">{feature.data.summary}</p>}
              {renderFeatureBody(feature.data.body)}
            </div>
          </article>
        </div>
      )}
    </div>
  )
}

// Quebra o texto em parágrafos (por linha) e destaca prefixos de
// pergunta/resposta (P:, R:, Pergunta:, Resposta:).
function renderParagraphs(text: string) {
  const parts = (text ?? '')
    .split(/\n+/)
    .map((s) => s.trim())
    .filter(Boolean)
  return parts.map((p, i) => {
    const m = p.match(/^(P|R|Pergunta|Resposta)\s*[:\-–)]\s*(.*)$/i)
    if (m) {
      return (
        <p key={i} className="text-xs leading-relaxed text-ink">
          <span className="font-bold text-orange">{m[1].toUpperCase().startsWith('P') ? 'P' : 'R'}:</span>{' '}
          {m[2]}
        </p>
      )
    }
    return (
      <p key={i} className="text-xs leading-relaxed text-ink">
        {p}
      </p>
    )
  })
}

// Renderiza texto respeitando quebras de linha; linhas iniciadas por
// "-", "•" ou "*" viram itens numerados (regras de ouro).
function renderRichText(paragraphs: string[]) {
  const lines = (paragraphs ?? [])
    .join('\n')
    // separadores " - " no meio da linha viram novo item
    .replace(/\s+[-•*]\s+/g, '\n- ')
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)

  const blocks: JSX.Element[] = []
  let bullets: string[] = []
  let key = 0

  const flush = () => {
    if (bullets.length) {
      const items = [...bullets]
      blocks.push(
        <ul key={`u${key++}`} className="space-y-1.5">
          {items.map((b, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-ink-secondary">
              <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-orange text-[11px] font-bold text-white">
                {i + 1}
              </span>
              {b}
            </li>
          ))}
        </ul>,
      )
      bullets = []
    }
  }

  for (const line of lines) {
    const m = line.match(/^[-•*]\s*(.*)$/)
    if (m && m[1]) {
      bullets.push(m[1])
    } else {
      flush()
      blocks.push(
        <p key={`p${key++}`} className="text-sm font-medium leading-relaxed text-ink">
          {line}
        </p>,
      )
    }
  }
  flush()

  return <div className="space-y-2.5">{blocks}</div>
}

// Renderiza o corpo de um bloco (Processo/Treinamento): blocos com várias
// linhas viram lista com marcadores; blocos de uma linha viram parágrafo.
function renderFeatureBody(paragraphs: string[]) {
  return (paragraphs ?? []).filter(Boolean).map((para, idx) => {
    const lines = para
      .split('\n')
      .map((l) => l.trim().replace(/^[-•*]\s*/, ''))
      .filter(Boolean)
    if (lines.length > 1) {
      return (
        <ul key={idx} className="space-y-1.5">
          {lines.map((l, i) => (
            <li key={i} className="flex items-start gap-2 text-sm leading-relaxed text-ink-secondary">
              <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-orange" />
              {l}
            </li>
          ))}
        </ul>
      )
    }
    return (
      <p key={idx} className="leading-relaxed text-ink-secondary">
        {lines[0]}
      </p>
    )
  })
}

type IconType = typeof Workflow

// Card clicável (coluna) — Processo
function FeatureCard({ section, icon: Icon, feature, onOpen }: { section: string; icon: IconType; feature: EditionFeature; onOpen: () => void }) {
  const teaser = feature.summary || feature.body?.filter(Boolean)[0] || ''
  return (
    <button onClick={onOpen} className="card group flex flex-col overflow-hidden p-0 text-left transition-shadow duration-200 hover:border-orange hover:shadow-card-hover">
      {feature.image && (
        <div className="h-32 w-full overflow-hidden">
          <img src={feature.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: `center ${feature.pos ?? 50}%` }} />
        </div>
      )}
      <div className="flex flex-1 flex-col p-5">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon size={16} className="text-orange" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink">{section}</h3>
          </div>
          <Maximize2 size={14} className="shrink-0 text-ink-muted transition-colors group-hover:text-orange" />
        </div>
        {feature.title && <h4 className="text-base font-bold leading-snug text-ink group-hover:text-orange">{feature.title}</h4>}
        {teaser && <p className="mt-1 line-clamp-3 flex-1 text-sm text-ink-secondary">{teaser}</p>}
        <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-orange">
          Abrir <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  )
}

// Banner clicável (largura total) — Treinamento
function FeatureBanner({ section, icon: Icon, feature, onOpen }: { section: string; icon: IconType; feature: EditionFeature; onOpen: () => void }) {
  const teaser = feature.summary || feature.body?.filter(Boolean)[0] || ''
  return (
    <button onClick={onOpen} className="card group flex w-full flex-col overflow-hidden p-0 text-left transition-shadow duration-200 hover:border-orange hover:shadow-card-hover sm:flex-row">
      {feature.image && (
        <div className="h-40 w-full overflow-hidden sm:h-auto sm:w-72 sm:shrink-0">
          <img src={feature.image} alt="" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" style={{ objectPosition: `center ${feature.pos ?? 50}%` }} />
        </div>
      )}
      <div className="flex flex-1 flex-col justify-center p-6">
        <div className="mb-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Icon size={18} className="text-orange" />
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink">{section}</h3>
          </div>
          <Maximize2 size={15} className="shrink-0 text-ink-muted transition-colors group-hover:text-orange" />
        </div>
        {feature.title && <h4 className="text-lg font-extrabold leading-snug text-ink group-hover:text-orange">{feature.title}</h4>}
        {teaser && <p className="mt-1 line-clamp-2 text-sm text-ink-secondary">{teaser}</p>}
        <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-orange">
          Abrir <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
        </span>
      </div>
    </button>
  )
}

function LoadingState() {
  return (
    <div className="portal-container py-8">
      <div className="mb-5 h-12 w-72 animate-pulse rounded bg-bg-secondary" />
      <div className="grid gap-4 lg:grid-cols-12">
        <div className="h-[340px] animate-pulse rounded-card bg-bg-secondary lg:col-span-5" />
        <div className="h-[340px] animate-pulse rounded-card bg-bg-secondary lg:col-span-4" />
        <div className="h-[340px] animate-pulse rounded-card bg-bg-secondary lg:col-span-3" />
      </div>
    </div>
  )
}
