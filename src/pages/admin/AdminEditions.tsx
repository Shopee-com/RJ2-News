import { useEffect, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  Plus, Pencil, Trash2, Eye, Loader2, LogOut, KeyRound, Newspaper, ExternalLink,
} from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/lib/auth'
import {
  fetchAllEditions, deleteEdition, createEdition, emptyEdition, nextEditionNumber,
  type Edition, type EditionStatus,
} from '@/data/editions'
import { formatDateShort } from '@/lib/format'

const STATUS_LABEL: Record<EditionStatus, string> = {
  draft: 'Rascunho',
  scheduled: 'Agendada',
  published: 'Publicada',
}
const STATUS_TONE: Record<EditionStatus, 'neutral' | 'warn' | 'success'> = {
  draft: 'neutral',
  scheduled: 'warn',
  published: 'success',
}

export default function AdminEditions() {
  const { profile, signOut } = useAuth()
  const navigate = useNavigate()
  const [editions, setEditions] = useState<Edition[]>([])
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    setLoading(true)
    try {
      setEditions(await fetchAllEditions())
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
      const n = await nextEditionNumber()
      const created = await createEdition(emptyEdition(n))
      navigate(`/admin/edicao/${created.id}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(ed: Edition) {
    if (!confirm(`Excluir a Edição #${ed.number}? Esta ação não pode ser desfeita.`)) return
    setBusy(true)
    try {
      await deleteEdition(ed.id)
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
        title="Edições do Jornal"
        subtitle={`Você está logado como ${profile?.email}. Crie, edite, publique e agende as edições.`}
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Admin' }]}
        actions={
          <>
            <Link to="/admin/senha" className="btn-ghost">
              <KeyRound size={15} /> Trocar senha
            </Link>
            <button
              onClick={async () => {
                await signOut()
                navigate('/')
              }}
              className="btn-ghost"
            >
              <LogOut size={15} /> Sair
            </button>
          </>
        }
      />

      <div className="portal-container py-6">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-ink-secondary">
            <Newspaper size={16} className="text-orange" />
            {editions.length} edição(ões)
            <Link to="/jornada" className="link-arrow ml-2">
              Ver jornal público <ExternalLink size={13} />
            </Link>
          </div>
          <button onClick={onCreate} disabled={busy} className="btn-primary disabled:opacity-60">
            {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />}
            Nova edição
          </button>
        </div>

        {error && (
          <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>
        )}

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="animate-spin text-orange" size={28} />
          </div>
        ) : (
          <div className="card overflow-hidden">
            <div className="hidden grid-cols-12 gap-3 border-b border-line bg-bg-secondary px-4 py-2.5 text-label font-bold uppercase tracking-wide text-ink-muted sm:grid">
              <span className="col-span-1">Edição</span>
              <span className="col-span-5">Título</span>
              <span className="col-span-2">Data</span>
              <span className="col-span-2">Status</span>
              <span className="col-span-2 text-right">Ações</span>
            </div>
            {editions.map((ed) => (
              <div key={ed.id} className="grid grid-cols-2 items-center gap-3 border-b border-line px-4 py-3 last:border-0 sm:grid-cols-12">
                <span className="col-span-1 text-sm font-bold text-orange">#{ed.number}</span>
                <span className="col-span-5 min-w-0">
                  <span className="block truncate text-sm font-semibold text-ink">{ed.hero.title || '(sem título)'}</span>
                  <span className="flex items-center gap-1 text-xs text-ink-muted"><Eye size={11} /> {ed.views}</span>
                </span>
                <span className="col-span-2 text-sm text-ink-secondary">{formatDateShort(ed.edition_date)}</span>
                <span className="col-span-2">
                  <Badge tone={STATUS_TONE[ed.status]}>{STATUS_LABEL[ed.status]}</Badge>
                  {ed.status === 'scheduled' && ed.publish_at && (
                    <span className="mt-0.5 block text-[11px] text-ink-muted">
                      {new Date(ed.publish_at).toLocaleString('pt-BR')}
                    </span>
                  )}
                </span>
                <span className="col-span-2 flex items-center justify-end gap-2">
                  <Link
                    to={`/admin/edicao/${ed.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-secondary hover:border-orange hover:text-orange"
                    aria-label="Editar"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => onDelete(ed)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-secondary hover:border-danger hover:text-danger"
                    aria-label="Excluir"
                  >
                    <Trash2 size={14} />
                  </button>
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </>
  )
}
