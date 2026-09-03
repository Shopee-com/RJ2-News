import { useEffect, useState } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { Plus, Pencil, Trash2, Loader2, ArrowLeft, EyeOff } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import { COLLECTIONS, adminFetchAll, adminCreate, adminDelete } from '@/data/admin'

export default function AdminCollection() {
  const { key = '' } = useParams()
  const config = COLLECTIONS[key]
  const navigate = useNavigate()
  const [rows, setRows] = useState<any[]>([]) // eslint-disable-line @typescript-eslint/no-explicit-any
  const [loading, setLoading] = useState(true)
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function load() {
    if (!config) return
    setLoading(true)
    try {
      setRows(await adminFetchAll(config.table))
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key])

  if (!config) {
    return (
      <div className="portal-container py-16 text-center">
        <p className="text-sm text-danger">Coleção não encontrada.</p>
        <Link to="/admin" className="link-arrow mt-3 justify-center">← Voltar ao painel</Link>
      </div>
    )
  }

  async function onCreate() {
    setBusy(true)
    try {
      const created = await adminCreate(config.table, config.defaults())
      navigate(`/admin/colecao/${key}/${created.id}`)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  async function onDelete(row: any) { // eslint-disable-line @typescript-eslint/no-explicit-any
    if (!confirm(`Excluir "${row[config.display] ?? 'item'}"? Esta ação não pode ser desfeita.`)) return
    setBusy(true)
    try {
      await adminDelete(config.table, row.id)
      await load()
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setBusy(false)
    }
  }

  const hasPublished = config.fields.some((f) => f.name === 'published')
  const hasStatus = config.fields.some((f) => f.name === 'status')

  return (
    <>
      <PageHeader
        eyebrow="Painel Administrativo"
        title={config.label}
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Admin', to: '/admin' }, { label: config.label }]}
        actions={
          <>
            <Link to="/admin" className="btn-ghost"><ArrowLeft size={15} /> Painel</Link>
            <button onClick={onCreate} disabled={busy} className="btn-primary disabled:opacity-60">
              {busy ? <Loader2 size={15} className="animate-spin" /> : <Plus size={15} />} Adicionar {config.singular}
            </button>
          </>
        }
      />

      <div className="portal-container py-6">
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange" size={28} /></div>
        ) : rows.length === 0 ? (
          <EmptyState message={`Nenhum(a) ${config.singular} cadastrado(a) ainda.`} />
        ) : (
          <div className="card divide-y divide-line">
            {rows.map((row) => (
              <div key={row.id} className="flex items-center justify-between gap-3 px-4 py-3">
                <div className="min-w-0">
                  <p className="truncate text-sm font-semibold text-ink">{row[config.display] || '(sem título)'}</p>
                  <p className="truncate text-xs text-ink-muted">
                    {row.category || row.role || row.area || row.provider || ''}
                  </p>
                </div>
                <div className="flex shrink-0 items-center gap-2">
                  {hasStatus && (
                    <Badge tone={row.status === 'published' ? 'success' : row.status === 'scheduled' ? 'warn' : 'neutral'}>
                      {row.status === 'published' ? 'Publicada' : row.status === 'scheduled' ? 'Agendada' : 'Rascunho'}
                    </Badge>
                  )}
                  {hasPublished && !row.published && (
                    <Badge tone="neutral"><EyeOff size={11} /> Oculto</Badge>
                  )}
                  <Link
                    to={`/admin/colecao/${key}/${row.id}`}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-secondary hover:border-orange hover:text-orange"
                    aria-label="Editar"
                  >
                    <Pencil size={14} />
                  </Link>
                  <button
                    onClick={() => onDelete(row)}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-ink-secondary hover:border-danger hover:text-danger"
                    aria-label="Excluir"
                  >
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
