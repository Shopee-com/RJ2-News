import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, BarChart3, HelpCircle } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { fetchAllQuizzes, createQuiz, deleteQuiz, type Quiz, type QuizStatus } from '@/data/quiz'
import { formatDateShort } from '@/lib/format'

const STATUS: Record<QuizStatus, { label: string; tone: 'neutral' | 'warn' | 'success' }> = {
  draft: { label: 'Rascunho', tone: 'neutral' },
  scheduled: { label: 'Agendado', tone: 'warn' },
  published: { label: 'Publicado', tone: 'success' },
}

export default function AdminQuizzes() {
  const navigate = useNavigate()
  const [quizzes, setQuizzes] = useState<Quiz[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      setQuizzes(await fetchAllQuizzes())
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    load()
  }, [])

  async function onCreate() {
    setBusy(true)
    try {
      const q = await createQuiz()
      navigate(`/admin/quiz/${q.id}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(q: Quiz) {
    if (!confirm(`Excluir o quiz "${q.title}" e todas as respostas? Esta ação não pode ser desfeita.`)) return
    setBusy(true)
    try {
      await deleteQuiz(q.id)
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Painel Administrativo"
        title="Quiz"
        subtitle="Crie o quiz da semana, publique e acompanhe os resultados."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Admin', to: '/admin' }, { label: 'Quiz' }]}
        actions={
          <>
            <Link to="/admin" className="btn-ghost"><ArrowLeft size={15} /> Painel</Link>
            <button onClick={onCreate} disabled={busy} className="btn-primary disabled:opacity-60">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Novo quiz
            </button>
          </>
        }
      />
      <div className="portal-container py-6">
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange" size={28} /></div>
        ) : quizzes.length === 0 ? (
          <EmptyState message="Nenhum quiz criado ainda." />
        ) : (
          <div className="card divide-y divide-line">
            {quizzes.map((q) => (
              <div key={q.id} className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex min-w-0 items-center gap-3">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-orange-light text-orange">
                    <HelpCircle size={18} />
                  </span>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-semibold text-ink">{q.title}</p>
                    <p className="text-xs text-ink-muted">
                      {q.publish_at ? formatDateShort(q.publish_at) : '—'}
                    </p>
                  </div>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  <Badge tone={STATUS[q.status].tone}>{STATUS[q.status].label}</Badge>
                  <Link to={`/admin/quiz/${q.id}/resultados`} className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs font-semibold text-ink-secondary hover:border-orange hover:text-orange">
                    <BarChart3 size={14} /> Resultados
                  </Link>
                  <Link to={`/admin/quiz/${q.id}`} className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-secondary hover:border-orange hover:text-orange" aria-label="Editar">
                    <Pencil size={14} />
                  </Link>
                  <button onClick={() => onDelete(q)} className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-secondary hover:border-danger hover:text-danger" aria-label="Excluir">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
