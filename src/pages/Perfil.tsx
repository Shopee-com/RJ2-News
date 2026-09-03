import { useEffect, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import { Loader2, Save, Camera, KeyRound, CheckCircle2, ShieldCheck, IdCard, Mail } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import { useAuth } from '@/lib/auth'
import { supabase } from '@/lib/supabase'
import { fetchOperations, fetchLocalities } from '@/data/access'
import { useAsync } from '@/lib/useAsync'
import { avatar } from '@/lib/media'

const inputCls = 'h-11 w-full rounded-lg border border-line bg-white px-3 text-sm outline-none focus:border-orange'

export default function Perfil() {
  const { profile, session, updateMyProfile, updatePassword } = useAuth()
  const { data: operations } = useAsync(fetchOperations, [])
  const { data: localities } = useAsync(fetchLocalities, [])
  const fileRef = useRef<HTMLInputElement>(null)

  const [name, setName] = useState('')
  const [operation, setOperation] = useState('')
  const [locality, setLocality] = useState('')
  const [photo, setPhoto] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [ok, setOk] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const [pass, setPass] = useState('')
  const [passOk, setPassOk] = useState(false)
  const [passErr, setPassErr] = useState<string | null>(null)
  const [passSaving, setPassSaving] = useState(false)

  useEffect(() => {
    if (profile) {
      setName(profile.name ?? '')
      setOperation(profile.operation ?? '')
      setLocality(profile.locality ?? '')
      setPhoto(profile.photo ?? '')
    }
  }, [profile])

  if (!profile) return null

  const localityOptions = (localities ?? []).filter((l) => !operation || l.operation === operation)
  const currentPhoto = photo || avatar(profile.id, 200)

  async function onUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file || !session) return
    if (file.size > 3 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 3 MB.')
      return
    }
    setUploading(true)
    setError(null)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${session.user.id}/${Date.now()}.${ext}`
      const { error: upErr } = await supabase.storage
        .from('avatars')
        .upload(path, file, { upsert: true, contentType: file.type })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('avatars').getPublicUrl(path)
      setPhoto(data.publicUrl)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  async function save() {
    setSaving(true)
    setOk(false)
    setError(null)
    const { error } = await updateMyProfile({ name, photo, operation, locality })
    setSaving(false)
    if (error) setError(error)
    else setOk(true)
  }

  async function savePassword() {
    setPassErr(null)
    setPassOk(false)
    if (pass.length < 6) return setPassErr('A senha deve ter pelo menos 6 caracteres.')
    setPassSaving(true)
    const { error } = await updatePassword(pass)
    setPassSaving(false)
    if (error) setPassErr(error)
    else {
      setPassOk(true)
      setPass('')
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Minha conta"
        title="Meu perfil"
        subtitle="Atualize seus dados, foto e senha."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Perfil' }]}
      />

      <div className="portal-container grid gap-6 py-6 lg:grid-cols-3">
        {/* Foto + status */}
        <div className="card flex flex-col items-center p-6 text-center">
          <div className="relative">
            <img src={currentPhoto} alt="" className="h-28 w-28 rounded-full object-cover ring-4 ring-orange-light" />
            <button
              onClick={() => fileRef.current?.click()}
              disabled={uploading}
              className="absolute bottom-0 right-0 flex h-9 w-9 items-center justify-center rounded-full bg-orange text-white shadow-card hover:bg-orange-hover disabled:opacity-60"
              aria-label="Trocar foto"
            >
              {uploading ? <Loader2 size={15} className="animate-spin" /> : <Camera size={15} />}
            </button>
            <input ref={fileRef} type="file" accept="image/*" onChange={onUpload} className="hidden" />
          </div>
          <h2 className="mt-3 text-base font-bold text-ink">{profile.name || 'Sem nome'}</h2>
          <div className="mt-2 flex flex-wrap justify-center gap-1.5">
            {profile.role === 'admin' && <Badge tone="orange"><ShieldCheck size={11} /> Admin</Badge>}
            <Badge tone={profile.status === 'approved' ? 'success' : 'warn'}>
              {profile.status === 'approved' ? 'Aprovado' : 'Pendente'}
            </Badge>
          </div>
          <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-ink-muted">
            {profile.opsid ? <IdCard size={13} /> : <Mail size={13} />}
            {profile.opsid ? `OpsID: ${profile.opsid}` : profile.email}
          </p>
          <p className="mt-1 text-[11px] text-ink-muted">Foto: JPG/PNG até 3 MB</p>
        </div>

        {/* Dados */}
        <div className="lg:col-span-2 space-y-6">
          <div className="card p-6">
            <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink">Dados</h3>
            {ok && <p className="mb-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-success"><CheckCircle2 size={15} /> Perfil atualizado.</p>}
            {error && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">{error}</p>}

            <div className="grid gap-4 sm:grid-cols-2">
              <label className="block sm:col-span-2">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Nome completo</span>
                <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Operação</span>
                <select className={inputCls} value={operation} onChange={(e) => { setOperation(e.target.value); setLocality('') }}>
                  <option value="">Selecione...</option>
                  {(operations ?? []).map((o) => <option key={o.id} value={o.name}>{o.name}</option>)}
                </select>
              </label>
              <label className="block">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Localidade</span>
                <select className={inputCls} value={locality} onChange={(e) => setLocality(e.target.value)}>
                  <option value="">Selecione...</option>
                  {localityOptions.map((l) => <option key={l.id} value={l.name}>{l.name}</option>)}
                </select>
              </label>
            </div>

            <div className="mt-5 border-t border-line pt-4">
              <button onClick={save} disabled={saving} className="btn-primary disabled:opacity-60">
                {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />} Salvar alterações
              </button>
            </div>
          </div>

          {/* Senha */}
          <div className="card p-6">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-bold uppercase tracking-wide text-ink">
              <KeyRound size={15} className="text-orange" /> Trocar senha
            </h3>
            {passOk && <p className="mb-3 flex items-center gap-2 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-success"><CheckCircle2 size={15} /> Senha alterada.</p>}
            {passErr && <p className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm font-medium text-danger">{passErr}</p>}
            <div className="flex flex-col gap-3 sm:flex-row sm:items-end">
              <label className="block flex-1">
                <span className="mb-1 block text-xs font-semibold text-ink-secondary">Nova senha</span>
                <input type="password" className={inputCls} value={pass} onChange={(e) => setPass(e.target.value)} placeholder="Mínimo 6 caracteres" />
              </label>
              <button onClick={savePassword} disabled={passSaving} className="btn-ghost disabled:opacity-60">
                {passSaving ? <Loader2 size={15} className="animate-spin" /> : <KeyRound size={15} />} Alterar senha
              </button>
            </div>
          </div>

          {profile.role === 'admin' && (
            <Link to="/admin" className="link-arrow">Ir para o painel administrativo →</Link>
          )}
        </div>
      </div>
    </>
  )
}
