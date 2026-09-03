import { useParams, Link } from 'react-router-dom'
import { Download, ArrowLeft, CheckCircle2, Lock } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import Badge from '@/components/ui/Badge'
import EmptyState from '@/components/ui/EmptyState'
import Loading from '@/components/ui/Loading'
import { getPopById } from '@/data/content'
import { useAsync } from '@/lib/useAsync'
import { useAuth } from '@/lib/auth'
import { safeUrl } from '@/lib/url'
import { formatDateShort } from '@/lib/format'

export default function PopDetail() {
  const { id = '' } = useParams()
  const { isAdmin } = useAuth()
  const { data: pop, loading } = useAsync(() => getPopById(id), [id])

  if (loading) return <Loading label="Carregando procedimento..." />

  if (!pop) {
    return (
      <div className="portal-container py-16">
        <EmptyState message="Procedimento não encontrado." />
        <div className="mt-4 text-center">
          <Link to="/pop" className="link-arrow justify-center">← Voltar para POP</Link>
        </div>
      </div>
    )
  }

  if (pop.status === 'Em revisão' && !isAdmin) {
    return (
      <>
        <PageHeader
          eyebrow={pop.code}
          title={pop.name}
          crumbs={[{ label: 'Início', to: '/' }, { label: 'POP', to: '/pop' }, { label: pop.code }]}
        />
        <div className="portal-container py-16">
          <div className="card mx-auto max-w-lg p-8 text-center">
            <span className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-orange-light text-orange">
              <Lock size={26} />
            </span>
            <h2 className="text-lg font-bold text-ink">Procedimento em revisão</h2>
            <p className="mt-2 text-sm text-ink-secondary">
              Este POP está passando por revisão e ficará indisponível para visualização até ser publicado novamente.
            </p>
            <Link to="/pop" className="btn-primary mx-auto mt-6 w-fit">
              <ArrowLeft size={15} /> Voltar para a biblioteca
            </Link>
          </div>
        </div>
      </>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow={pop.code}
        title={pop.name}
        subtitle={pop.summary}
        crumbs={[{ label: 'Início', to: '/' }, { label: 'POP', to: '/pop' }, { label: pop.code }]}
        actions={
          pop.downloadUrl ? (
            <a href={safeUrl(pop.downloadUrl)} target="_blank" rel="noopener noreferrer" className="btn-primary">
              <Download size={15} /> Baixar
            </a>
          ) : null
        }
      />

      <div className="portal-container grid gap-6 py-6 lg:grid-cols-3">
        <div className="lg:col-span-2">
          <div className="card p-6">
            <h2 className="mb-4 text-lg font-bold text-ink">Etapas do procedimento</h2>
            <ol className="space-y-3">
              {pop.steps.map((step, i) => (
                <li key={i} className="flex gap-3">
                  <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-orange text-xs font-bold text-white">
                    {i + 1}
                  </span>
                  <p className="pt-0.5 text-sm text-ink-secondary">{step}</p>
                </li>
              ))}
            </ol>
          </div>

          <div className="card mt-4 p-6">
            <h2 className="mb-3 text-lg font-bold text-ink">Boas práticas</h2>
            <ul className="space-y-2">
              {['Siga a sequência das etapas sem pular verificações.', 'Registre exceções imediatamente no sistema.', 'Em caso de dúvida, acione a liderança do turno.'].map((t) => (
                <li key={t} className="flex items-center gap-2 text-sm text-ink-secondary">
                  <CheckCircle2 size={16} className="shrink-0 text-success" /> {t}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <aside className="space-y-4">
          <div className="card p-5">
            <h3 className="mb-3 text-sm font-bold uppercase tracking-wide text-ink">Informações</h3>
            <dl className="space-y-3 text-sm">
              {[
                ['Código', pop.code],
                ['Categoria', pop.category],
                ['Versão', pop.version],
                ['Atualização', formatDateShort(pop.updatedAt)],
                ['Responsável', pop.owner],
              ].map(([k, v]) => (
                <div key={k} className="flex items-center justify-between gap-3">
                  <dt className="text-ink-muted">{k}</dt>
                  <dd className="text-right font-semibold text-ink">{v}</dd>
                </div>
              ))}
              <div className="flex items-center justify-between gap-3">
                <dt className="text-ink-muted">Status</dt>
                <dd>
                  <Badge tone={pop.status === 'Vigente' ? 'success' : pop.status === 'Em revisão' ? 'warn' : 'neutral'}>
                    {pop.status}
                  </Badge>
                </dd>
              </div>
            </dl>
          </div>

          <Link to="/pop" className="btn-ghost w-full">
            <ArrowLeft size={15} /> Voltar para a biblioteca
          </Link>
        </aside>
      </div>
    </>
  )
}
