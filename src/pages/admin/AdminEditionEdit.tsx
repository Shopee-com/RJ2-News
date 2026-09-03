import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Save, ArrowLeft, Plus, Trash2, Eye, Send, X, ScanEye } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import ImageUploader from '@/components/ui/ImageUploader'
import { fetchEditionById, updateEdition, type Edition, type EditionStatus } from '@/data/editions'

// ---- helpers de conversão de data ----
function isoToLocalInput(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const off = d.getTimezoneOffset()
  const local = new Date(d.getTime() - off * 60000)
  return local.toISOString().slice(0, 16)
}
function localInputToIso(v: string): string | null {
  if (!v) return null
  return new Date(v).toISOString()
}

export default function AdminEditionEdit() {
  const { id = '' } = useParams()
  const [edition, setEdition] = useState<Edition | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)
  const [preview, setPreview] = useState(false)

  useEffect(() => {
    fetchEditionById(id)
      .then((e) => setEdition(e))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  function patch(p: Partial<Edition>) {
    setEdition((prev) => (prev ? { ...prev, ...p } : prev))
  }

  async function save(overrideStatus?: EditionStatus) {
    if (!edition) return
    setSaving(true)
    setError(null)
    setOk(null)
    try {
      let publish_at = edition.publish_at
      let status = overrideStatus ?? edition.status
      if (status === 'published' && !publish_at) publish_at = new Date().toISOString()
      const saved = await updateEdition(edition.id, { ...edition, status, publish_at })
      setEdition(saved)
      setOk('Alterações salvas com sucesso.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  if (loading)
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="animate-spin text-orange" size={28} />
      </div>
    )
  if (!edition)
    return (
      <div className="portal-container py-16 text-center">
        <p className="text-sm text-danger">Edição não encontrada.</p>
        <Link to="/admin/edicoes" className="link-arrow mt-3 justify-center">← Voltar</Link>
      </div>
    )

  return (
    <>
      <PageHeader
        eyebrow={`Edição #${edition.number}`}
        title="Editar edição"
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Admin', to: '/admin' }, { label: `#${edition.number}` }]}
        actions={
          <>
            <Link to="/jornada" className="btn-ghost"><Eye size={15} /> Ver jornal</Link>
            <button onClick={() => save()} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar
            </button>
          </>
        }
      />

      <div className="portal-container grid gap-6 py-6 lg:grid-cols-3">
        {/* Coluna principal */}
        <div className="space-y-6 lg:col-span-2">
          <Section title="Entrevista principal (capa)">
            <Field label="Título">
              <input className={inputCls} value={edition.hero.title} onChange={(e) => patch({ hero: { ...edition.hero, title: e.target.value } })} />
            </Field>
            <Field label="Subtítulo">
              <textarea className={inputCls} rows={2} value={edition.hero.subtitle} onChange={(e) => patch({ hero: { ...edition.hero, subtitle: e.target.value } })} />
            </Field>
            <div>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Foto de capa</span>
              <ImageUploader
                value={edition.hero.image}
                onChange={(image) => patch({ hero: { ...edition.hero, image } })}
                folder="editions"
                pos={edition.hero.pos ?? 50}
                onPosChange={(pos) => patch({ hero: { ...edition.hero, pos } })}
              />
            </div>
            <Field label="Rótulo do botão">
              <input className={inputCls} value={edition.hero.cta_label} onChange={(e) => patch({ hero: { ...edition.hero, cta_label: e.target.value } })} />
            </Field>
            <Field label="Texto completo da entrevista">
              <textarea
                className={`${inputCls} min-h-[220px] leading-relaxed`}
                value={edition.hero.body.join('\n\n')}
                onChange={(e) =>
                  patch({
                    hero: {
                      ...edition.hero,
                      body: e.target.value.split(/\n\s*\n/).map((p) => p.trim()),
                    },
                  })
                }
                placeholder="Escreva o texto completo aqui. Separe os parágrafos com uma linha em branco."
              />
            </Field>
            <p className="-mt-1 text-[11px] text-ink-muted">
              Dica: deixe uma linha em branco entre os parágrafos. É assim que o texto aparece na leitura da edição.
            </p>
            <button type="button" onClick={() => setPreview(true)} className="btn-ghost w-fit">
              <ScanEye size={15} /> Pré-visualizar leitura
            </button>
          </Section>

          <Section title="Regra de Ouro HSE">
            <div>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Foto (lateral)</span>
              <ImageUploader
                value={edition.golden_rules.image}
                onChange={(image) => patch({ golden_rules: { ...edition.golden_rules, image } })}
                folder="hse"
                pos={edition.golden_rules.pos ?? 50}
                onPosChange={(pos) => patch({ golden_rules: { ...edition.golden_rules, pos } })}
              />
            </div>
            <Field label="Texto e regras">
              <textarea
                className={`${inputCls} min-h-[180px] leading-relaxed`}
                value={(edition.golden_rules.body ?? []).join('\n\n')}
                onChange={(e) =>
                  patch({
                    golden_rules: {
                      ...edition.golden_rules,
                      body: e.target.value.split(/\n\s*\n/).map((p) => p.trim()),
                    },
                  })
                }
                placeholder={'Mentalidade consciente na operação:\n- Utilizar os EPIs obrigatórios\n- Comunicar condições inseguras ao líder\n- Respeitar as sinalizações'}
              />
            </Field>
            <p className="-mt-1 text-[11px] text-ink-muted">
              Cada linha começando com "-" vira um item numerado. Linhas normais viram parágrafos.
            </p>
            <Field label="Frase de efeito"><input className={inputCls} value={edition.golden_rules.tagline} onChange={(e) => patch({ golden_rules: { ...edition.golden_rules, tagline: e.target.value } })} /></Field>
          </Section>

          <Section title="Boas práticas de uma operação">
            <StringList label="Itens" values={edition.best_practices.items} onChange={(items) => patch({ best_practices: { ...edition.best_practices, items } })} />
            <Field label="Frase de efeito"><input className={inputCls} value={edition.best_practices.tagline} onChange={(e) => patch({ best_practices: { ...edition.best_practices, tagline: e.target.value } })} /></Field>
          </Section>

          <Section title="Projetos em andamento">
            {edition.projects.map((p, i) => (
              <div key={i} className="flex items-end gap-2">
                <Field label="Nome" className="flex-1"><input className={inputCls} value={p.name} onChange={(e) => { const projects = [...edition.projects]; projects[i] = { ...p, name: e.target.value }; patch({ projects }) }} /></Field>
                <Field label="%" className="w-20"><input type="number" min={0} max={100} className={inputCls} value={p.progress} onChange={(e) => { const projects = [...edition.projects]; projects[i] = { ...p, progress: Number(e.target.value) }; patch({ projects }) }} /></Field>
                <button onClick={() => patch({ projects: edition.projects.filter((_, j) => j !== i) })} className={removeBtn} aria-label="Remover"><Trash2 size={14} /></button>
              </div>
            ))}
            <AddButton onClick={() => patch({ projects: [...edition.projects, { name: '', progress: 0 }] })} label="Adicionar projeto" />
          </Section>

          <Section title="Processo">
            <div>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Foto</span>
              <ImageUploader
                value={edition.processo.image}
                onChange={(image) => patch({ processo: { ...edition.processo, image } })}
                folder="processo"
                pos={edition.processo.pos ?? 50}
                onPosChange={(pos) => patch({ processo: { ...edition.processo, pos } })}
              />
            </div>
            <Field label="Título"><input className={inputCls} value={edition.processo.title} onChange={(e) => patch({ processo: { ...edition.processo, title: e.target.value } })} /></Field>
            <Field label="Resumo (aparece no card)"><textarea className={inputCls} rows={2} value={edition.processo.summary} onChange={(e) => patch({ processo: { ...edition.processo, summary: e.target.value } })} /></Field>
            <Field label="Texto completo (parágrafos)">
              <textarea
                className={`${inputCls} min-h-[140px] leading-relaxed`}
                value={(edition.processo.body ?? []).join('\n\n')}
                onChange={(e) => patch({ processo: { ...edition.processo, body: e.target.value.split(/\n\s*\n/).map((p) => p.trim()) } })}
                placeholder="Texto que aparece ao abrir. Separe os parágrafos com uma linha em branco."
              />
            </Field>
          </Section>

          <Section title="Olha o Treinamento Passando">
            <div>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Foto</span>
              <ImageUploader
                value={edition.treinamento.image}
                onChange={(image) => patch({ treinamento: { ...edition.treinamento, image } })}
                folder="treinamento"
                pos={edition.treinamento.pos ?? 50}
                onPosChange={(pos) => patch({ treinamento: { ...edition.treinamento, pos } })}
              />
            </div>
            <Field label="Título"><input className={inputCls} value={edition.treinamento.title} onChange={(e) => patch({ treinamento: { ...edition.treinamento, title: e.target.value } })} /></Field>
            <Field label="Resumo (aparece no banner)"><textarea className={inputCls} rows={2} value={edition.treinamento.summary} onChange={(e) => patch({ treinamento: { ...edition.treinamento, summary: e.target.value } })} /></Field>
            <Field label="Texto completo (parágrafos)">
              <textarea
                className={`${inputCls} min-h-[140px] leading-relaxed`}
                value={(edition.treinamento.body ?? []).join('\n\n')}
                onChange={(e) => patch({ treinamento: { ...edition.treinamento, body: e.target.value.split(/\n\s*\n/).map((p) => p.trim()) } })}
                placeholder="Texto que aparece ao abrir. Separe os parágrafos com uma linha em branco."
              />
            </Field>
          </Section>

          <Section title="Dica da Gestão">
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Nome"><input className={inputCls} value={edition.interview.name} onChange={(e) => patch({ interview: { ...edition.interview, name: e.target.value } })} /></Field>
              <Field label="Cargo"><input className={inputCls} value={edition.interview.role} onChange={(e) => patch({ interview: { ...edition.interview, role: e.target.value } })} /></Field>
            </div>
            <div>
              <span className="mb-1 block text-xs font-semibold text-ink-secondary">Foto</span>
              <ImageUploader
                value={edition.interview.photo}
                onChange={(photo) => patch({ interview: { ...edition.interview, photo } })}
                folder="entrevistas"
                pos={edition.interview.pos ?? 50}
                onPosChange={(pos) => patch({ interview: { ...edition.interview, pos } })}
              />
            </div>
            <Field label="Citação"><textarea className={inputCls} rows={2} value={edition.interview.quote} onChange={(e) => patch({ interview: { ...edition.interview, quote: e.target.value } })} /></Field>
            <Field label="Destaque"><textarea className={inputCls} rows={2} value={edition.interview.highlight} onChange={(e) => patch({ interview: { ...edition.interview, highlight: e.target.value } })} /></Field>
          </Section>

          <Section title="Comunicados importantes">
            <StringList label="Comunicados" values={edition.announcements} onChange={(announcements) => patch({ announcements })} />
          </Section>
        </div>

        {/* Coluna lateral — publicação */}
        <aside className="space-y-4">
          <div className="card sticky top-20 p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Publicação</h3>

            {ok && <p className="mb-3 rounded-lg bg-green-50 px-3 py-2 text-xs font-medium text-success">{ok}</p>}
            {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-danger">{error}</p>}

            <div className="grid grid-cols-2 gap-3">
              <Field label="Nº da edição"><input type="number" className={inputCls} value={edition.number} onChange={(e) => patch({ number: Number(e.target.value) })} /></Field>
              <Field label="Data"><input type="date" className={inputCls} value={edition.edition_date} onChange={(e) => patch({ edition_date: e.target.value })} /></Field>
            </div>

            <Field label="Status">
              <select className={inputCls} value={edition.status} onChange={(e) => patch({ status: e.target.value as EditionStatus })}>
                <option value="draft">Rascunho</option>
                <option value="scheduled">Agendada</option>
                <option value="published">Publicada</option>
              </select>
            </Field>

            {(edition.status === 'scheduled' || edition.status === 'published') && (
              <Field label={edition.status === 'scheduled' ? 'Publicar em' : 'Publicado em'}>
                <input
                  type="datetime-local"
                  className={inputCls}
                  value={isoToLocalInput(edition.publish_at)}
                  onChange={(e) => patch({ publish_at: localInputToIso(e.target.value) })}
                />
              </Field>
            )}

            <p className="mb-3 mt-1 text-[11px] leading-relaxed text-ink-muted">
              Rascunho e agendada não aparecem no jornal público. Uma edição agendada passa a aparecer
              automaticamente quando o horário chega.
            </p>

            <div className="space-y-2">
              <button onClick={() => save()} disabled={saving} className="btn-primary w-full disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar
              </button>
              {edition.status !== 'published' && (
                <button onClick={() => save('published')} disabled={saving} className="btn-ghost w-full">
                  <Send size={15} /> Salvar e publicar agora
                </button>
              )}
              <Link to="/admin/edicoes" className="btn-ghost w-full"><ArrowLeft size={15} /> Voltar</Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Pré-visualização da leitura (mesmo formato do jornal) */}
      {preview && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-4 pt-[6vh] backdrop-blur-sm" onClick={() => setPreview(false)}>
          <article className="w-full max-w-2xl overflow-hidden rounded-card bg-white shadow-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="relative h-56 bg-dark">
              {edition.hero.image && <img src={edition.hero.image} alt="" className="h-full w-full object-cover opacity-80" style={{ objectPosition: `center ${edition.hero.pos ?? 50}%` }} />}
              <div className="absolute inset-0 bg-gradient-to-t from-dark/90 to-transparent" />
              <button onClick={() => setPreview(false)} className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-white/90 text-ink hover:bg-white" aria-label="Fechar">
                <X size={16} />
              </button>
              <div className="absolute inset-x-0 bottom-0 p-5">
                <span className="label-chip rounded bg-orange px-2 py-1 text-white">Edição #{edition.number}</span>
                <h2 className="mt-2 text-2xl font-extrabold text-white">{edition.hero.title || '(sem título)'}</h2>
              </div>
            </div>
            <div className="max-h-[50vh] space-y-3 overflow-y-auto p-6">
              {edition.hero.subtitle && <p className="text-base font-medium text-ink">{edition.hero.subtitle}</p>}
              {edition.hero.body.filter(Boolean).map((p, i) => (
                <p key={i} className="leading-relaxed text-ink-secondary">{p}</p>
              ))}
            </div>
            <div className="border-t border-line px-6 py-3 text-center text-[11px] text-ink-muted">
              Pré-visualização — salve para publicar as alterações.
            </div>
          </article>
        </div>
      )}
    </>
  )
}

// ---------------------------------------------------------------------------
// Subcomponentes de formulário
// ---------------------------------------------------------------------------
const inputCls =
  'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-orange'
const removeBtn =
  'flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink-muted hover:border-danger hover:text-danger'

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="card p-5">
      <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink">{title}</h3>
      <div className="space-y-3">{children}</div>
    </div>
  )
}

function Field({ label, children, className = '' }: { label: string; children: React.ReactNode; className?: string }) {
  return (
    <label className={`block ${className}`}>
      <span className="mb-1 block text-xs font-semibold text-ink-secondary">{label}</span>
      {children}
    </label>
  )
}

function AddButton({ onClick, label }: { onClick: () => void; label: string }) {
  return (
    <button onClick={onClick} className="flex items-center gap-1.5 text-sm font-semibold text-orange hover:text-orange-hover">
      <Plus size={15} /> {label}
    </button>
  )
}

function StringList({
  label, values, onChange, textarea = false,
}: {
  label: string
  values: string[]
  onChange: (v: string[]) => void
  textarea?: boolean
}) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-ink-secondary">{label}</span>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-start gap-2">
            {textarea ? (
              <textarea className={inputCls} rows={2} value={v} onChange={(e) => { const n = [...values]; n[i] = e.target.value; onChange(n) }} />
            ) : (
              <input className={inputCls} value={v} onChange={(e) => { const n = [...values]; n[i] = e.target.value; onChange(n) }} />
            )}
            <button onClick={() => onChange(values.filter((_, j) => j !== i))} className={removeBtn} aria-label="Remover"><Trash2 size={14} /></button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...values, ''])} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-orange hover:text-orange-hover">
        <Plus size={15} /> Adicionar
      </button>
    </div>
  )
}
