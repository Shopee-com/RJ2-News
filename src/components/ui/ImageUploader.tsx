import { useRef, useState } from 'react'
import { Upload, Loader2, Link as LinkIcon } from 'lucide-react'
import { supabase } from '@/lib/supabase'

interface ImageUploaderProps {
  value: string
  onChange: (url: string) => void
  folder?: string
  /** posição vertical (0–100) para ajustar o enquadramento */
  pos?: number
  onPosChange?: (pos: number) => void
}

export default function ImageUploader({ value, onChange, folder = 'editions', pos, onPosChange }: ImageUploaderProps) {
  const fileRef = useRef<HTMLInputElement>(null)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const showPos = typeof pos === 'number' && typeof onPosChange === 'function'

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 6 * 1024 * 1024) {
      setError('A imagem deve ter no máximo 6 MB.')
      return
    }
    setError(null)
    setUploading(true)
    try {
      const ext = file.name.split('.').pop() || 'jpg'
      const path = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2, 7)}.${ext}`
      const { error: upErr } = await supabase.storage.from('media').upload(path, file, {
        upsert: true,
        contentType: file.type,
      })
      if (upErr) throw upErr
      const { data } = supabase.storage.from('media').getPublicUrl(path)
      onChange(data.publicUrl)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setUploading(false)
    }
  }

  return (
    <div className="space-y-2">
      {/* Preview com enquadramento */}
      <div className="relative h-40 w-full overflow-hidden rounded-lg border border-line bg-bg-secondary">
        {value ? (
          <img
            src={value}
            alt=""
            className="h-full w-full object-cover"
            style={{ objectPosition: `center ${pos ?? 50}%` }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-xs text-ink-muted">
            Nenhuma imagem
          </div>
        )}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => fileRef.current?.click()}
          disabled={uploading}
          className="btn-ghost disabled:opacity-60"
        >
          {uploading ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
          Enviar foto
        </button>
        <input ref={fileRef} type="file" accept="image/*" onChange={onFile} className="hidden" />
      </div>

      {/* URL manual (opcional) */}
      <div className="relative">
        <LinkIcon size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-ink-muted" />
        <input
          className="w-full rounded-lg border border-line bg-white py-2 pl-8 pr-3 text-xs outline-none focus:border-orange"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="ou cole um link https://..."
        />
      </div>

      {/* Ajuste de enquadramento vertical */}
      {showPos && (
        <div>
          <div className="mb-1 flex items-center justify-between text-[11px] font-semibold text-ink-secondary">
            <span>Enquadramento (subir / descer)</span>
            <span className="text-ink-muted">{pos}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={pos}
            onChange={(e) => onPosChange?.(Number(e.target.value))}
            className="w-full accent-[#EE4D2D]"
          />
          <div className="flex justify-between text-[10px] text-ink-muted">
            <span>Topo</span>
            <span>Centro</span>
            <span>Base</span>
          </div>
        </div>
      )}

      {error && <p className="text-xs font-medium text-danger">{error}</p>}
    </div>
  )
}
