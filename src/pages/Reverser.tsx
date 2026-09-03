import { ExternalLink, Wrench } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Loading from '@/components/ui/Loading'
import { getSettings } from '@/data/settings'
import { useAsync } from '@/lib/useAsync'
import { safeUrl } from '@/lib/url'

export default function Reverser() {
  const { data: settings, loading } = useAsync(getSettings, [])

  const url = safeUrl(settings?.reverser_url || 'https://cartacontrole.vercel.app/')
  const label = settings?.reverser_label || 'Abrir ferramenta'
  const desc = settings?.reverser_desc || 'Acesse a ferramenta oficial da operação reversa.'

  return (
    <>
      <PageHeader
        eyebrow="Central de Ferramentas"
        title="SPX Reverser"
        subtitle="Acesso rápido às ferramentas da operação reversa."
        crumbs={[{ label: 'Início', to: '/' }, { label: 'SPX Reverser' }]}
      />
      <div className="portal-container py-10">
        {loading ? (
          <Loading label="Carregando..." />
        ) : (
          <div className="mx-auto max-w-lg">
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="card group flex flex-col items-center gap-4 p-10 text-center transition-all duration-200 hover:border-orange hover:shadow-card-hover"
            >
              <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-orange-light text-orange transition-transform group-hover:scale-105">
                <Wrench size={30} />
              </span>
              <div>
                <h2 className="text-xl font-extrabold text-ink group-hover:text-orange">{label}</h2>
                <p className="mt-1 text-sm text-ink-secondary">{desc}</p>
              </div>
              <span className="btn-primary mt-2">
                {label} <ExternalLink size={16} />
              </span>
              <span className="break-all text-xs text-ink-muted">{url}</span>
            </a>
          </div>
        )}
      </div>
    </>
  )
}
