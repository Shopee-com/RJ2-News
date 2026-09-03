import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, ArrowLeft, Eye, EyeOff, CheckCircle2, ChevronUp, ChevronDown, Save, RotateCcw } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { NAV_ITEMS } from '@/lib/nav'
import { fetchNavConfig, mergeNav, saveNavConfig, type NavEntry } from '@/data/navSettings'

const inputCls = 'w-full rounded-lg border border-line bg-white px-3 py-2 text-sm outline-none focus:border-orange'

export default function AdminNav() {
  const [entries, setEntries] = useState<NavEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [ok, setOk] = useState(false)

  useEffect(() => {
    fetchNavConfig()
      .then((c) => setEntries(mergeNav(c)))
      .catch((e) => setError((e as Error).message))
      .finally(() => setLoading(false))
  }, [])

  function move(i: number, dir: -1 | 1) {
    setEntries((prev) => {
      const next = [...prev]
      const j = i + dir
      if (j < 0 || j >= next.length) return prev
      ;[next[i], next[j]] = [next[j], next[i]]
      return next
    })
  }
  function setLabel(to: string, label: string) {
    setEntries((prev) => prev.map((e) => (e.to === to ? { ...e, label } : e)))
  }
  function toggle(to: string) {
    setEntries((prev) => prev.map((e) => (e.to === to ? { ...e, visible: !e.visible } : e)))
  }
  function reset() {
    setEntries(NAV_ITEMS.map((it, i) => ({ to: it.to, label: it.label, visible: true, sort: i })))
  }

  async function save() {
    setSaving(true)
    setError(null)
    setOk(false)
    try {
      await saveNavConfig(entries)
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
        title="Abas do menu"
        subtitle="Reordene, renomeie e habilite/desabilite as abas da navegação."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Admin', to: '/admin' }, { label: 'Abas do menu' }]}
        actions={
          <>
            <Link to="/admin" className="btn-ghost"><ArrowLeft size={15} /> Painel</Link>
            <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
              {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar
            </button>
          </>
        }
      />
      <div className="portal-container py-6">
        {ok && <p className="mb-4 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-success"><CheckCircle2 size={15} /> Menu atualizado.</p>}
        {error && <p className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-danger">{error}</p>}

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 className="animate-spin text-orange" size={28} /></div>
        ) : (
          <div className="max-w-2xl space-y-2">
            {entries.map((e, i) => {
              const isHome = e.to === '/'
              return (
                <div key={e.to} className={`card flex items-center gap-3 p-3 ${e.visible ? '' : 'opacity-60'}`}>
                  {/* reordenar */}
                  <div className="flex flex-col">
                    <button onClick={() => move(i, -1)} disabled={i === 0} className="text-ink-muted hover:text-orange disabled:opacity-30" aria-label="Subir"><ChevronUp size={16} /></button>
                    <button onClick={() => move(i, 1)} disabled={i === entries.length - 1} className="text-ink-muted hover:text-orange disabled:opacity-30" aria-label="Descer"><ChevronDown size={16} /></button>
                  </div>
                  <span className="w-6 shrink-0 text-center text-xs font-bold text-ink-muted">{i + 1}</span>
                  {/* nome */}
                  <input className={`${inputCls} flex-1`} value={e.label} onChange={(ev) => setLabel(e.to, ev.target.value)} />
                  <span className="hidden w-40 truncate text-xs text-ink-muted sm:block">{e.to}</span>
                  {/* visibilidade */}
                  {isHome ? (
                    <span className="flex w-24 items-center justify-center gap-1 text-xs text-ink-muted"><Eye size={13} /> Fixa</span>
                  ) : (
                    <button
                      onClick={() => toggle(e.to)}
                      className={`flex w-24 items-center justify-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-semibold ${e.visible ? 'bg-green-50 text-success' : 'bg-bg-secondary text-ink-muted'}`}
                    >
                      {e.visible ? <Eye size={13} /> : <EyeOff size={13} />}
                      {e.visible ? 'Visível' : 'Oculta'}
                    </button>
                  )}
                </div>
              )
            })}

            <div className="flex items-center justify-between pt-2">
              <button onClick={reset} className="flex items-center gap-1.5 text-sm font-semibold text-ink-secondary hover:text-orange">
                <RotateCcw size={14} /> Restaurar padrão
              </button>
              <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar
              </button>
            </div>
            <p className="pt-2 text-xs text-ink-muted">
              Use as setas para ordenar, edite o nome no campo, e ligue/desligue com o botão. Início fica sempre visível. As mudanças aparecem após recarregar o portal.
            </p>
          </div>
        )}
      </div>
    </>
  )
}
