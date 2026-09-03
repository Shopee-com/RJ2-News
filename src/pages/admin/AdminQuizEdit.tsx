import { useEffect, useRef, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Save, ArrowLeft, Plus, Trash2, Upload, Send, BarChart3, FileText } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import {
  fetchQuiz, fetchQuestions, updateQuiz, saveQuestions, parseQuizCsv,
  type Quiz, type QuizQuestion, type QuizStatus,
} from '@/data/quiz'

const inputCls = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-orange'

function isoToLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  return new Date(d.getTime() - d.getTimezoneOffset() * 60000).toISOString().slice(0, 16)
}
function localToIso(v: string): string | null {
  return v ? new Date(v).toISOString() : null
}

export default function AdminQuizEdit() {
  const { id = '' } = useParams()
  const fileRef = useRef<HTMLInputElement>(null)
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [csv, setCsv] = useState('')

  useEffect(() => {
    Promise.all([fetchQuiz(id), fetchQuestions(id)])
      .then(([q, qs]) => {
        setQuiz(q)
        setQuestions(qs.length ? qs : [])
      })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-orange" size={28} /></div>
  if (!quiz)
    return (
      <div className="portal-container py-16 text-center">
        <p className="text-sm text-danger">Quiz não encontrado.</p>
        <Link to="/admin/quiz" className="link-arrow mt-3 justify-center">← Voltar</Link>
      </div>
    )

  function patchQuiz(p: Partial<Quiz>) {
    setQuiz((prev) => (prev ? { ...prev, ...p } : prev))
  }
  function setQ(i: number, p: Partial<QuizQuestion>) {
    setQuestions((prev) => prev.map((q, j) => (j === i ? { ...q, ...p } : q)))
  }
  function addQuestion() {
    setQuestions((prev) => [...prev, { ord: prev.length, question: '', options: ['', ''], correct_index: 0 }])
  }

  async function save(overrideStatus?: QuizStatus) {
    if (!quiz) return
    setSaving(true)
    setError(null)
    setOk(null)
    try {
      let publish_at = quiz.publish_at
      const status = overrideStatus ?? quiz.status
      if (status === 'published' && !publish_at) publish_at = new Date().toISOString()
      const savedQuiz = await updateQuiz(quiz.id, { title: quiz.title, description: quiz.description, status, publish_at })
      await saveQuestions(quiz.id, questions.filter((q) => q.question.trim() && q.options.filter(Boolean).length >= 2))
      setQuiz(savedQuiz)
      setOk('Quiz salvo com sucesso.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  function importCsv(text: string) {
    const parsed = parseQuizCsv(text)
    if (parsed.length === 0) {
      setError('Não foi possível ler o CSV. Verifique o formato.')
      return
    }
    setQuestions(parsed)
    setCsv('')
    setOk(`${parsed.length} pergunta(s) importada(s). Revise e salve.`)
  }

  return (
    <>
      <PageHeader
        eyebrow="Quiz"
        title="Editar quiz"
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Admin', to: '/admin' }, { label: 'Quiz', to: '/admin/quiz' }, { label: 'Editar' }]}
        actions={
          <>
            <Link to={`/admin/quiz/${quiz.id}/resultados`} className="btn-ghost"><BarChart3 size={15} /> Resultados</Link>
            <button onClick={() => save()} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar
            </button>
          </>
        }
      />

      <div className="portal-container grid gap-6 py-6 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          {ok && <p className="rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-success">{ok}</p>}
          {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">{error}</p>}

          <div className="card space-y-3 p-5">
            <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Dados do quiz</h3>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-ink-secondary">Título</span>
              <input className={inputCls} value={quiz.title} onChange={(e) => patchQuiz({ title: e.target.value })} /></label>
            <label className="block"><span className="mb-1 block text-xs font-semibold text-ink-secondary">Descrição</span>
              <textarea className={inputCls} rows={2} value={quiz.description ?? ''} onChange={(e) => patchQuiz({ description: e.target.value })} /></label>
          </div>

          {/* Importar CSV */}
          <div className="card space-y-3 p-5">
            <div className="flex items-center gap-2">
              <FileText size={16} className="text-orange" />
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Importar por CSV</h3>
            </div>
            <p className="text-xs text-ink-muted">
              Formato: <code>pergunta;opcao1;opcao2;...;correta</code> (correta = número da opção certa). Uma pergunta por linha.
            </p>
            <textarea
              className={`${inputCls} min-h-[120px] font-mono text-xs`}
              value={csv}
              onChange={(e) => setCsv(e.target.value)}
              placeholder={'pergunta;opcao1;opcao2;opcao3;correta\n"Qual EPI é obrigatório?";"Capacete";"Chinelo";"Boné";1'}
            />
            <div className="flex flex-wrap gap-2">
              <button onClick={() => importCsv(csv)} disabled={!csv.trim()} className="btn-ghost disabled:opacity-60">
                <Upload size={15} /> Importar do texto
              </button>
              <button onClick={() => fileRef.current?.click()} className="btn-ghost">
                <Upload size={15} /> Enviar arquivo .csv
              </button>
              <input ref={fileRef} type="file" accept=".csv,text/csv" className="hidden"
                onChange={(e) => { const f = e.target.files?.[0]; if (f) f.text().then(importCsv) }} />
            </div>
          </div>

          {/* Perguntas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wide text-ink">Perguntas ({questions.length})</h3>
              <button onClick={addQuestion} className="flex items-center gap-1.5 text-sm font-semibold text-orange hover:text-orange-hover">
                <Plus size={15} /> Adicionar pergunta
              </button>
            </div>

            {questions.map((q, i) => (
              <div key={i} className="card p-5">
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-xs font-bold text-ink-muted">Pergunta {i + 1}</span>
                  <button onClick={() => setQuestions((prev) => prev.filter((_, j) => j !== i))} className="text-ink-muted hover:text-danger" aria-label="Remover">
                    <Trash2 size={15} />
                  </button>
                </div>
                <input className={`${inputCls} mb-3`} placeholder="Enunciado da pergunta" value={q.question} onChange={(e) => setQ(i, { question: e.target.value })} />
                <p className="mb-1 text-xs font-semibold text-ink-secondary">Opções (marque a correta)</p>
                <div className="space-y-2">
                  {q.options.map((opt, oi) => (
                    <div key={oi} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${i}`} checked={q.correct_index === oi} onChange={() => setQ(i, { correct_index: oi })} className="accent-[#EE4D2D]" aria-label="Correta" />
                      <input className={inputCls} value={opt} placeholder={`Opção ${oi + 1}`}
                        onChange={(e) => { const options = [...q.options]; options[oi] = e.target.value; setQ(i, { options }) }} />
                      <button onClick={() => { const options = q.options.filter((_, j) => j !== oi); setQ(i, { options, correct_index: Math.min(q.correct_index, options.length - 1) }) }}
                        className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink-muted hover:border-danger hover:text-danger" aria-label="Remover opção">
                        <Trash2 size={13} />
                      </button>
                    </div>
                  ))}
                </div>
                <button onClick={() => setQ(i, { options: [...q.options, ''] })} className="mt-2 flex items-center gap-1.5 text-xs font-semibold text-orange hover:text-orange-hover">
                  <Plus size={13} /> Adicionar opção
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Publicação */}
        <aside className="space-y-4">
          <div className="card sticky top-20 p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Publicação</h3>
            <label className="mb-3 block"><span className="mb-1 block text-xs font-semibold text-ink-secondary">Status</span>
              <select className={inputCls} value={quiz.status} onChange={(e) => patchQuiz({ status: e.target.value as QuizStatus })}>
                <option value="draft">Rascunho</option>
                <option value="scheduled">Agendado</option>
                <option value="published">Publicado</option>
              </select>
            </label>
            {(quiz.status === 'scheduled' || quiz.status === 'published') && (
              <label className="mb-3 block"><span className="mb-1 block text-xs font-semibold text-ink-secondary">{quiz.status === 'scheduled' ? 'Publicar em' : 'Publicado em'}</span>
                <input type="datetime-local" className={inputCls} value={isoToLocal(quiz.publish_at)} onChange={(e) => patchQuiz({ publish_at: localToIso(e.target.value) })} />
              </label>
            )}
            <p className="mb-3 text-[11px] leading-relaxed text-ink-muted">
              Rascunho e agendado não aparecem para os usuários. Cada pessoa responde uma vez por quiz.
            </p>
            <div className="space-y-2">
              <button onClick={() => save()} disabled={saving} className="btn-primary w-full disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar
              </button>
              {quiz.status !== 'published' && (
                <button onClick={() => save('published')} disabled={saving} className="btn-ghost w-full">
                  <Send size={15} /> Salvar e publicar agora
                </button>
              )}
              <Link to="/admin/quiz" className="btn-ghost w-full"><ArrowLeft size={15} /> Voltar</Link>
            </div>
          </div>
        </aside>
      </div>
    </>
  )
}
