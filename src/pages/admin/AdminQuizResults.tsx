import { useEffect, useMemo, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, ArrowLeft, Users, CheckCircle2, XCircle, Percent, Download, Eye, X } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import {
  fetchQuiz, fetchAttempts, fetchQuestions, fetchAttemptAnswers,
  type Quiz, type QuizAttempt, type QuizQuestion, type AttemptAnswer,
} from '@/data/quiz'
import { formatDateShort } from '@/lib/format'

export default function AdminQuizResults() {
  const { id = '' } = useParams()
  const [quiz, setQuiz] = useState<Quiz | null>(null)
  const [attempts, setAttempts] = useState<QuizAttempt[]>([])
  const [questions, setQuestions] = useState<QuizQuestion[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // detalhe de um participante
  const [detail, setDetail] = useState<QuizAttempt | null>(null)
  const [detailAnswers, setDetailAnswers] = useState<AttemptAnswer[] | null>(null)
  const [detailLoading, setDetailLoading] = useState(false)

  useEffect(() => {
    Promise.all([fetchQuiz(id), fetchAttempts(id), fetchQuestions(id)])
      .then(([q, a, qs]) => { setQuiz(q); setAttempts(a); setQuestions(qs) })
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [id])

  async function openDetail(a: QuizAttempt) {
    setDetail(a)
    setDetailAnswers(null)
    setDetailLoading(true)
    try {
      setDetailAnswers(await fetchAttemptAnswers(a.id))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setDetailLoading(false)
    }
  }

  const totals = useMemo(() => {
    const people = attempts.length
    const correct = attempts.reduce((s, a) => s + a.score, 0)
    const wrong = attempts.reduce((s, a) => s + (a.total - a.score), 0)
    const pct = correct + wrong > 0 ? Math.round((correct / (correct + wrong)) * 100) : 0
    return { people, correct, wrong, pct }
  }, [attempts])

  const byOperation = useMemo(() => {
    const map: Record<string, { op: string; people: number; correct: number; wrong: number }> = {}
    for (const a of attempts) {
      const op = a.operation || '(sem operação)'
      map[op] ??= { op, people: 0, correct: 0, wrong: 0 }
      map[op].people++
      map[op].correct += a.score
      map[op].wrong += a.total - a.score
    }
    return Object.values(map).sort((x, y) => y.people - x.people)
  }, [attempts])

  function exportCsv() {
    const header = 'Nome;OpsID;Operacao;Localidade;Acertos;Total;Data'
    const lines = attempts.map((a) =>
      [a.name ?? '', a.opsid ?? '', a.operation ?? '', a.locality ?? '', a.score, a.total, formatDateShort(a.created_at)]
        .map((v) => `"${String(v).replace(/"/g, '""')}"`).join(';'),
    )
    const blob = new Blob(['﻿' + [header, ...lines].join('\n')], { type: 'text/csv;charset=utf-8' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = `quiz-resultados.csv`
    link.click()
    URL.revokeObjectURL(url)
  }

  if (loading) return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-orange" size={28} /></div>

  return (
    <>
      <PageHeader
        eyebrow="Quiz · Resultados"
        title={quiz?.title ?? 'Resultados'}
        subtitle="Quem respondeu, acertos e erros por operação."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Admin', to: '/admin' }, { label: 'Quiz', to: '/admin/quiz' }, { label: 'Resultados' }]}
        actions={
          <>
            <Link to={`/admin/quiz/${id}`} className="btn-ghost"><ArrowLeft size={15} /> Editar</Link>
            {attempts.length > 0 && <button onClick={exportCsv} className="btn-primary"><Download size={15} /> Exportar CSV</button>}
          </>
        }
      />

      <div className="portal-container py-6">
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

        {/* Totais */}
        <div className="mb-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat icon={Users} label="Participantes" value={String(totals.people)} />
          <Stat icon={CheckCircle2} label="Acertos" value={String(totals.correct)} tone="success" />
          <Stat icon={XCircle} label="Erros" value={String(totals.wrong)} tone="danger" />
          <Stat icon={Percent} label="Aproveitamento" value={`${totals.pct}%`} />
        </div>

        {attempts.length === 0 ? (
          <EmptyState message="Ninguém respondeu este quiz ainda." />
        ) : (
          <>
            {/* Por operação */}
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Por operação</h3>
            <div className="card mb-8 overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-bg-secondary text-left text-label uppercase tracking-wide text-ink-muted">
                    <th className="px-4 py-2.5">Operação</th>
                    <th className="px-4 py-2.5">Pessoas</th>
                    <th className="px-4 py-2.5 text-success">Acertos</th>
                    <th className="px-4 py-2.5 text-danger">Erros</th>
                    <th className="px-4 py-2.5">Aproveit.</th>
                  </tr>
                </thead>
                <tbody>
                  {byOperation.map((r) => {
                    const pct = r.correct + r.wrong > 0 ? Math.round((r.correct / (r.correct + r.wrong)) * 100) : 0
                    return (
                      <tr key={r.op} className="border-b border-line last:border-0">
                        <td className="px-4 py-2.5 font-semibold text-ink">{r.op}</td>
                        <td className="px-4 py-2.5 text-ink-secondary">{r.people}</td>
                        <td className="px-4 py-2.5 font-semibold text-success">{r.correct}</td>
                        <td className="px-4 py-2.5 font-semibold text-danger">{r.wrong}</td>
                        <td className="px-4 py-2.5">
                          <span className="inline-flex items-center gap-2">
                            <span className="h-1.5 w-16 overflow-hidden rounded-full bg-bg-secondary">
                              <span className="block h-full rounded-full bg-orange" style={{ width: `${pct}%` }} />
                            </span>
                            {pct}%
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>

            {/* Individual */}
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Participantes</h3>
            <div className="card overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-line bg-bg-secondary text-left text-label uppercase tracking-wide text-ink-muted">
                    <th className="px-4 py-2.5">Nome</th>
                    <th className="px-4 py-2.5">Operação</th>
                    <th className="px-4 py-2.5">Localidade</th>
                    <th className="px-4 py-2.5">Resultado</th>
                    <th className="px-4 py-2.5">Data</th>
                    <th className="px-4 py-2.5 text-right">Detalhe</th>
                  </tr>
                </thead>
                <tbody>
                  {attempts.map((a) => (
                    <tr key={a.id} className="border-b border-line last:border-0 hover:bg-bg-secondary">
                      <td className="px-4 py-2.5 font-medium text-ink">{a.name || a.opsid || '—'}</td>
                      <td className="px-4 py-2.5 text-ink-secondary">{a.operation || '—'}</td>
                      <td className="px-4 py-2.5 text-ink-secondary">{a.locality || '—'}</td>
                      <td className="px-4 py-2.5">
                        <span className={`font-bold ${a.score === a.total ? 'text-success' : a.score === 0 ? 'text-danger' : 'text-ink'}`}>
                          {a.score}/{a.total}
                        </span>
                      </td>
                      <td className="px-4 py-2.5 text-ink-muted">{formatDateShort(a.created_at)}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button onClick={() => openDetail(a)} className="inline-flex items-center gap-1 text-xs font-semibold text-orange hover:text-orange-hover">
                          <Eye size={13} /> Detalhes
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>

      {/* Detalhe do participante — questão por questão */}
      {detail && (
        <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/50 p-4 pt-[6vh] backdrop-blur-sm" onClick={() => setDetail(null)}>
          <article className="flex max-h-[88vh] w-full max-w-2xl flex-col overflow-hidden rounded-card bg-white shadow-panel animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <div className="flex shrink-0 items-center justify-between gap-3 border-b border-line px-5 py-4">
              <div className="min-w-0">
                <h2 className="truncate text-base font-bold text-ink">{detail.name || detail.opsid || 'Participante'}</h2>
                <p className="text-xs text-ink-muted">
                  {detail.operation || '—'} · {detail.locality || '—'} · <span className="font-semibold text-ink">{detail.score}/{detail.total}</span>
                </p>
              </div>
              <button onClick={() => setDetail(null)} className="shrink-0 text-ink-muted hover:text-ink" aria-label="Fechar"><X size={18} /></button>
            </div>

            <div className="flex-1 space-y-3 overflow-y-auto p-5">
              {detailLoading || !detailAnswers ? (
                <div className="flex justify-center py-10"><Loader2 className="animate-spin text-orange" size={24} /></div>
              ) : (
                questions.map((q, qi) => {
                  const ans = detailAnswers.find((a) => a.question_id === q.id)
                  const chosen = ans?.selected_index ?? null
                  const correct = q.correct_index
                  return (
                    <div key={q.id} className={`rounded-lg border p-4 ${ans?.is_correct ? 'border-green-200 bg-green-50/50' : 'border-red-200 bg-red-50/40'}`}>
                      <div className="mb-2 flex items-start gap-2">
                        {ans?.is_correct ? <CheckCircle2 size={16} className="mt-0.5 shrink-0 text-success" /> : <XCircle size={16} className="mt-0.5 shrink-0 text-danger" />}
                        <p className="text-sm font-semibold text-ink"><span className="mr-1 text-orange">{qi + 1}.</span>{q.question}</p>
                      </div>
                      <ul className="space-y-1 pl-6">
                        {q.options.map((opt, oi) => {
                          const isCorrect = oi === correct
                          const isChosen = oi === chosen
                          return (
                            <li key={oi} className={`flex items-center gap-2 text-sm ${isCorrect ? 'font-semibold text-success' : isChosen ? 'text-danger' : 'text-ink-secondary'}`}>
                              {isCorrect ? <CheckCircle2 size={13} className="shrink-0" /> : isChosen ? <XCircle size={13} className="shrink-0" /> : <span className="w-[13px] shrink-0" />}
                              {opt}
                              {isChosen && !isCorrect && <span className="text-xs text-danger">(marcou)</span>}
                              {isChosen && isCorrect && <span className="text-xs text-success">(marcou)</span>}
                            </li>
                          )
                        })}
                        {chosen === null && <li className="text-xs italic text-ink-muted">Não respondeu</li>}
                      </ul>
                    </div>
                  )
                })
              )}
            </div>
          </article>
        </div>
      )}
    </>
  )
}

function Stat({ icon: Icon, label, value, tone }: { icon: typeof Users; label: string; value: string; tone?: 'success' | 'danger' }) {
  return (
    <div className="card flex items-center gap-3 p-4">
      <span className={`flex h-10 w-10 items-center justify-center rounded-lg ${tone === 'success' ? 'bg-green-50 text-success' : tone === 'danger' ? 'bg-red-50 text-danger' : 'bg-orange-light text-orange'}`}>
        <Icon size={18} />
      </span>
      <div>
        <p className="text-xs text-ink-muted">{label}</p>
        <p className="text-xl font-extrabold text-ink">{value}</p>
      </div>
    </div>
  )
}
