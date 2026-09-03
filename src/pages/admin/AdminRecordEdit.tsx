import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import { Loader2, Save, ArrowLeft, Plus, Trash2, Eye } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import ImageUploader from '@/components/ui/ImageUploader'
import { COLLECTIONS, adminFetchOne, adminUpdate, type FieldConfig } from '@/data/admin'

/* eslint-disable @typescript-eslint/no-explicit-any */

const inputCls = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-orange'

function isoToLocal(iso: string | null): string {
  if (!iso) return ''
  const d = new Date(iso)
  const local = new Date(d.getTime() - d.getTimezoneOffset() * 60000)
  return local.toISOString().slice(0, 16)
}
function localToIso(v: string): string | null {
  return v ? new Date(v).toISOString() : null
}

const PUBLIC_PATH: Record<string, string> = {
  news: '/novidades',
  pops: '/pop',
  dashboards: '/dados',
  tools: '/reverser',
  jobs: '/vagas',
  people: '/time',
  projects: '/dados',
}

export default function AdminRecordEdit() {
  const { key = '', id = '' } = useParams()
  const config = COLLECTIONS[key]
  const [row, setRow] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState<string | null>(null)

  useEffect(() => {
    if (!config) return
    adminFetchOne(config.table, id)
      .then((r) => setRow(r))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key, id])

  if (!config) {
    return (
      <div className="portal-container py-16 text-center">
        <p className="text-sm text-danger">Coleção não encontrada.</p>
        <Link to="/admin" className="link-arrow mt-3 justify-center">← Voltar ao painel</Link>
      </div>
    )
  }

  if (loading)
    return <div className="flex min-h-[60vh] items-center justify-center"><Loader2 className="animate-spin text-orange" size={28} /></div>

  if (!row)
    return (
      <div className="portal-container py-16 text-center">
        <p className="text-sm text-danger">Registro não encontrado.</p>
        <Link to={`/admin/colecao/${key}`} className="link-arrow mt-3 justify-center">← Voltar</Link>
      </div>
    )

  function set(name: string, value: any) {
    setRow((prev: any) => ({ ...prev, [name]: value }))
  }

  async function save() {
    setSaving(true)
    setError(null)
    setOk(null)
    try {
      const saved = await adminUpdate(config.table, id, row)
      setRow(saved)
      setOk('Alterações salvas com sucesso.')
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow={`Editar ${config.singular}`}
        title={row[config.display] || `Novo(a) ${config.singular}`}
        crumbs={[
          { label: 'Início', to: '/' },
          { label: 'Admin', to: '/admin' },
          { label: config.label, to: `/admin/colecao/${key}` },
          { label: 'Editar' },
        ]}
        actions={
          <>
            <Link to={PUBLIC_PATH[key] ?? '/'} className="btn-ghost"><Eye size={15} /> Ver página</Link>
            <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar
            </button>
          </>
        }
      />

      <div className="portal-container py-6">
        {ok && <p className="mb-4 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-success">{ok}</p>}
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">{error}</p>}

        <div className="card p-6">
          <div className="grid gap-4 sm:grid-cols-2">
            {config.fields.map((f) => (
              <div key={f.name} className={f.full || f.type === 'list' || f.type === 'textarea' ? 'sm:col-span-2' : ''}>
                <FieldInput field={f} value={row[f.name]} onChange={(v) => set(f.name, v)} />
                {f.help && <p className="mt-1 text-[11px] text-ink-muted">{f.help}</p>}
              </div>
            ))}
          </div>

          <div className="mt-6 flex items-center gap-2 border-t border-line pt-4">
            <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar
            </button>
            <Link to={`/admin/colecao/${key}`} className="btn-ghost"><ArrowLeft size={15} /> Voltar</Link>
          </div>
        </div>
      </div>
    </>
  )
}

function FieldInput({ field, value, onChange }: { field: FieldConfig; value: any; onChange: (v: any) => void }) {
  const label = <span className="mb-1 block text-xs font-semibold text-ink-secondary">{field.label}</span>

  switch (field.type) {
    case 'textarea':
      return (
        <label className="block">
          {label}
          <textarea className={inputCls} rows={3} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        </label>
      )
    case 'number':
      return (
        <label className="block">
          {label}
          <input type="number" className={inputCls} value={value ?? 0} onChange={(e) => onChange(Number(e.target.value))} />
        </label>
      )
    case 'boolean':
      return (
        <label className="flex cursor-pointer items-center gap-2 pt-6">
          <input type="checkbox" checked={!!value} onChange={(e) => onChange(e.target.checked)} className="h-4 w-4 accent-[#EE4D2D]" />
          <span className="text-sm font-medium text-ink">{field.label}</span>
        </label>
      )
    case 'select':
      return (
        <label className="block">
          {label}
          <select className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value)}>
            {(field.options ?? []).map((o) => (
              <option key={o} value={o}>{o}</option>
            ))}
          </select>
        </label>
      )
    case 'date':
      return (
        <label className="block">
          {label}
          <input type="date" className={inputCls} value={value ? String(value).slice(0, 10) : ''} onChange={(e) => onChange(e.target.value)} />
        </label>
      )
    case 'datetime':
      return (
        <label className="block">
          {label}
          <input type="datetime-local" className={inputCls} value={isoToLocal(value)} onChange={(e) => onChange(localToIso(e.target.value))} />
        </label>
      )
    case 'image':
      return (
        <div>
          {label}
          <ImageUploader value={value ?? ''} onChange={(url) => onChange(url)} folder="conteudo" />
        </div>
      )
    case 'list':
      return <ListInput label={field.label} values={Array.isArray(value) ? value : []} onChange={onChange} />
    default:
      return (
        <label className="block">
          {label}
          <input className={inputCls} value={value ?? ''} onChange={(e) => onChange(e.target.value)} />
        </label>
      )
  }
}

function ListInput({ label, values, onChange }: { label: string; values: string[]; onChange: (v: string[]) => void }) {
  return (
    <div>
      <span className="mb-1 block text-xs font-semibold text-ink-secondary">{label}</span>
      <div className="space-y-2">
        {values.map((v, i) => (
          <div key={i} className="flex items-start gap-2">
            <textarea
              className={inputCls}
              rows={2}
              value={v}
              onChange={(e) => { const n = [...values]; n[i] = e.target.value; onChange(n) }}
            />
            <button
              onClick={() => onChange(values.filter((_, j) => j !== i))}
              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-line text-ink-muted hover:border-danger hover:text-danger"
              aria-label="Remover"
            >
              <Trash2 size={14} />
            </button>
          </div>
        ))}
      </div>
      <button onClick={() => onChange([...values, ''])} className="mt-2 flex items-center gap-1.5 text-sm font-semibold text-orange hover:text-orange-hover">
        <Plus size={15} /> Adicionar
      </button>
    </div>
  )
}
