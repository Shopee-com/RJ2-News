import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Save, ArrowLeft, CheckCircle2 } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { fetchSettingRows, saveSetting, type SettingRow } from '@/data/settings'

export default function AdminSettings() {
  const [rows, setRows] = useState<SettingRow[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchSettingRows()
      .then(setRows)
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  function setValue(key: string, value: string) {
    setRows((prev) => prev.map((r) => (r.key === key ? { ...r, value } : r)))
  }

  async function save() {
    setSaving(true)
    setOk(false)
    setError(null)
    try {
      await Promise.all(rows.map((r) => saveSetting(r.key, r.value ?? '')))
      setOk(true)
    } catch (e) {
      setError((e as Error).message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Painel Administrativo"
        title="Configurações"
        subtitle="Links e textos usados em páginas do portal."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Admin', to: '/admin' }, { label: 'Configurações' }]}
        actions={<Link to="/admin" className="btn-ghost"><ArrowLeft size={15} /> Painel</Link>}
      />

      <div className="portal-container py-6">
        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange" size={28} /></div>
        ) : (
          <div className="card max-w-2xl space-y-4 p-6">
            {ok && (
              <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-success">
                <CheckCircle2 size={15} /> Configurações salvas.
              </p>
            )}
            {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">{error}</p>}

            {rows.map((r) => (
              <label key={r.key} className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">{r.label ?? r.key}</span>
                <input
                  className="w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-orange"
                  value={r.value ?? ''}
                  onChange={(e) => setValue(r.key, e.target.value)}
                />
              </label>
            ))}

            <div className="flex items-center gap-2 border-t border-line pt-4">
              <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar
              </button>
              <Link to="/admin" className="btn-ghost"><ArrowLeft size={15} /> Voltar</Link>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
