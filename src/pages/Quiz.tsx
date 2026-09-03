import { useEffect, useMemo, useState } from 'react'
import { HelpCircle, CheckCircle2, XCircle, Loader2, ArrowLeft, Send, Trophy, ArrowRight } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Loading, { ErrorBox } from '@/components/ui/Loading'
import { useAsync } from '@/lib/useAsync'
import {
  listPublishedQuizzes, fetchMyAttempts, getQuizForTaking, submitQuiz,
  type QuizForTaking, type SubmitResult,
} from '@/data/quiz'
import { formatDateLong } from '@/lib/format'

export default function Quiz() {
  const { data: quizzes, loading, error } = useAsync(listPublishedQuizzes, [])
  const { data: mine, reload: reloadMine } = useAsync(fetchMyAttempts, [])
  const [openId, setOpenId] = useState<string | null>(null)

  if (loading) return (<><Head /><div className="portal-container"><Loading label="Carregando quiz..." /></div></>)
  if (error) return (<><Head /><div className="portal-container py-6"><ErrorBox message={error} /></div></>)

  if (openId) {
    return <TakeQuiz id={openId} onBack={() => { setOpenId(null); reloadMine() }} />
  }

  return (
    <>
      <Head />
      <div className="portal-container py-6">
        {(quizzes ?? []).length === 0 ? (
          <EmptyState message="Nenhum quiz disponível no momento." />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {(quizzes ?? []).map((q) => {
              const done = mine?.[q.id]
              return (
                <button
                  key={q.id}
                  onClick={() => setOpenId(q.id)}
                  className="card group flex flex-col p-5 text-left transition-shadow hover:border-orange hover:shadow-card-hover"
                >
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-lg bg-orange-light text-orange">
                      <HelpCircle size={18} />
                    </span>
                    {done ? (
                      <Badge tone="success">Respondido · {done.score}/{done.total}</Badge>
                    ) : (
                      <Badge tone="orange">Disponível</Badge>
                    )}
                  </div>
                  <h3 className="text-base font-bold text-ink group-hover:text-orange">{q.title}</h3>
                  {q.description && <p className="mt-1 line-clamp-2 flex-1 text-sm text-ink-secondary">{q.description}</p>}
                  {q.publish_at && <p className="mt-2 text-xs text-ink-muted">{formatDateLong(q.publish_at)}</p>}
                  <span className="mt-3 flex items-center gap-1 text-xs font-semibold text-orange">
                    {done ? 'Ver resultado' : 'Responder'} <ArrowRight size={12} className="transition-transform group-hover:translate-x-0.5" />
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </>
  )
}

function Head() {
  return (
    <PageHeader
      eyebrow="Aprenda e participe"
      title="Quiz"
      subtitle="Teste seus conhecimentos no quiz da semana."
      crumbs={[{ label: 'Início', to: '/' }, { label: 'Quiz' }]}
    />
  )
}

function TakeQuiz({ id, onBack }: { id: string; onBack: () => void }) {
  const [data, setData] = useState<QuizForTaking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [submitting, setSubmitting] = useState(false)
  const [result, setResult] = useState<SubmitResult | null>(null)

  useEffect(() => {
    getQuizForTaking(id)
      .then((d) => setData(d))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  const correctById = useMemo(() => {
    const m: Record<string, number> = {}
    result?.results.forEach((r) => (m[r.question_id] = r.correct_index))
    return m
  }, [result])

  if (loading) return <div className="portal-container"><Loading label="Carregando..." /></div>
  if (error || !data)
    return (
      <div className="portal-container py-16 text-center">
        <p className="text-sm text-danger">{error ?? 'Quiz não encontrado.'}</p>
        <button onClick={onBack} className="link-arrow mt-3 justify-center">← Voltar</button>
      </div>
    )

  const alreadyDone = !!data.attempt && !result
  const answeredCount = Object.keys(answers).length

  async function onSubmit() {
    if (!data) return
    setSubmitting(true)
    setError(null)
    try {
      const payload = data.questions.map((q) => ({
        question_id: q.id,
        selected_index: answers[q.id] ?? null,
      }))
      const res = await submitQuiz(id, payload)
      setResult(res)
      window.scrollTo({ top: 0 })
    } catch (e) {
      const msg = (e as Error).message
      setError(/already_submitted/.test(msg) ? 'Você já respondeu este quiz.' : msg)
    } finally {
      setSubmitting(false)
    }
  }

  const score = result?.score ?? data.attempt?.score
  const total = result?.total ?? data.attempt?.total ?? data.questions.length

  return (
    <>
      <PageHeader
        eyebrow="Quiz"
        title={data.quiz.title}
        subtitle={data.quiz.description ?? undefined}
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Quiz', to: '/quiz' }, { label: data.quiz.title }]}
        actions={<button onClick={onBack} className="btn-ghost"><ArrowLeft size={15} /> Voltar</button>}
      />

      <div className="portal-container py-6">
        {/* Resultado no topo */}
        {(result || data.attempt) && (
          <div className="card mb-5 flex items-center gap-4 border-l-4 border-l-orange p-5">
            <Trophy size={28} className="shrink-0 text-orange" />
            <div>
              <p className="text-sm text-ink-secondary">
                {result ? 'Suas respostas foram registradas!' : 'Você já respondeu este quiz.'}
              </p>
              <p className="text-lg font-extrabold text-ink">
                {score} de {total} corretas
              </p>
            </div>
          </div>
        )}

        {alreadyDone ? (
          <EmptyState message="Você já respondeu este quiz. O resultado está acima." />
        ) : (
          <div className="space-y-4">
            {data.questions.map((q, qi) => {
              const chosen = answers[q.id]
              const correct = result ? correctById[q.id] : undefined
              return (
                <div key={q.id} className="card p-5">
                  <p className="mb-3 font-semibold text-ink">
                    <span className="mr-2 text-orange">{qi + 1}.</span>{q.question}
                  </p>
                  <div className="space-y-2">
                    {q.options.map((opt, oi) => {
                      const isChosen = chosen === oi
                      const isCorrect = result && correct === oi
                      const isWrongChoice = result && isChosen && correct !== oi
                      return (
                        <label
                          key={oi}
                          className={`flex cursor-pointer items-center gap-3 rounded-lg border p-3 text-sm transition-colors ${
                            isCorrect
                              ? 'border-success bg-green-50'
                              : isWrongChoice
                                ? 'border-danger bg-red-50'
                                : isChosen
                                  ? 'border-orange bg-orange-light'
                                  : 'border-line hover:border-orange'
                          } ${result ? 'cursor-default' : ''}`}
                        >
                          <input
                            type="radio"
                            name={q.id}
                            checked={isChosen}
                            disabled={!!result}
                            onChange={() => setAnswers((p) => ({ ...p, [q.id]: oi }))}
                            className="accent-[#EE4D2D]"
                          />
                          <span className="flex-1 text-ink">{opt}</span>
                          {isCorrect && <CheckCircle2 size={16} className="text-success" />}
                          {isWrongChoice && <XCircle size={16} className="text-danger" />}
                        </label>
                      )
                    })}
                  </div>
                </div>
              )
            })}

            {!result && (
              <div className="flex items-center justify-between gap-3">
                <span className="text-sm text-ink-muted">{answeredCount}/{data.questions.length} respondidas</span>
                <button
                  onClick={onSubmit}
                  disabled={submitting || answeredCount < data.questions.length}
                  className="btn-primary disabled:opacity-60"
                >
                  {submitting ? <Loader2 size={15} className="animate-spin" /> : <Send size={15} />} Enviar respostas
                </button>
              </div>
            )}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
          </div>
        )}
      </div>
    </>
  )
}
