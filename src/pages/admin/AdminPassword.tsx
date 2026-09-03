import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { KeyRound, Loader2, ArrowLeft, CheckCircle2 } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import { useAuth } from '@/lib/auth'

export default function AdminPassword() {
  const { updatePassword } = useAuth()
  const navigate = useNavigate()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [saving, setSaving] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    if (password.length < 6) return setError('A senha deve ter pelo menos 6 caracteres.')
    if (password !== confirm) return setError('As senhas não coincidem.')
    setSaving(true)
    const { error } = await updatePassword(password)
    setSaving(false)
    if (error) setError(error)
    else {
      setDone(true)
      setTimeout(() => navigate('/admin'), 1500)
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Painel Administrativo"
        title="Trocar senha"
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Admin', to: '/admin' }, { label: 'Senha' }]}
      />
      <div className="portal-container py-6">
        <form onSubmit={onSubmit} className="card max-w-md space-y-4 p-6">
          {done ? (
            <p className="flex items-center gap-2 rounded-lg bg-green-50 px-3 py-3 text-sm font-medium text-success">
              <CheckCircle2 size={16} /> Senha alterada com sucesso!
            </p>
          ) : (
            <>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Nova senha</span>
                <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-orange" />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Confirmar nova senha</span>
                <input type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} className="h-11 w-full rounded-lg border border-line px-3 text-sm outline-none focus:border-orange" />
              </label>
              {error && <p className="rounded-lg bg-red-50 px-3 py-2 text-xs font-medium text-danger">{error}</p>}
              <div className="flex gap-2">
                <button type="submit" disabled={saving} className="btn-primary disabled:opacity-60">
                  {saving ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />} Salvar senha
                </button>
                <Link to="/admin" className="btn-ghost"><ArrowLeft size={15} /> Voltar</Link>
              </div>
            </>
          )}
        </form>
      </div>
    </>
  )
}
