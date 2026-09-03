import { useParams, Link } from 'react-router-dom'
import { Mail, MapPin, Clock, Layers, ArrowLeft, Quote } from 'lucide-react'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Loading from '@/components/ui/Loading'
import { getPersonById } from '@/data/content'
import { useAsync } from '@/lib/useAsync'

export default function PersonDetail() {
  const { id = '' } = useParams()
  const { data: person, loading } = useAsync(() => getPersonById(id), [id])

  if (loading) return <Loading label="Carregando perfil..." />

  if (!person) {
    return (
      <div className="portal-container py-16">
        <EmptyState message="Pessoa não encontrada." />
        <div className="mt-4 text-center">
          <Link to="/time" className="link-arrow justify-center">← Voltar para o Time</Link>
        </div>
      </div>
    )
  }

  return (
    <>
      <PageHeader
        eyebrow={person.level}
        title={person.name}
        subtitle={person.role}
        crumbs={[{ label: 'Início', to: '/' }, { label: 'Time', to: '/time' }, { label: person.name }]}
      />

      <div className="portal-container grid gap-6 py-6 lg:grid-cols-3">
        <div className="card flex flex-col items-center p-6 text-center">
          <img src={person.photo} alt={person.name} className="h-28 w-28 rounded-full object-cover ring-4 ring-orange-light" />
          <h2 className="mt-4 text-lg font-bold text-ink">{person.name}</h2>
          <p className="text-sm text-orange">{person.role}</p>
          <a href={`mailto:${person.contact}`} className="btn-primary mt-4 w-full">
            <Mail size={15} /> Enviar e-mail
          </a>
        </div>

        <div className="card p-6 lg:col-span-2">
          <h3 className="mb-4 text-sm font-bold uppercase tracking-wide text-ink">Informações</h3>
          <dl className="grid gap-4 sm:grid-cols-2">
            {[
              { icon: Layers, k: 'Nível', v: person.level },
              { icon: MapPin, k: 'Região', v: person.region },
              { icon: Clock, k: 'Turno', v: person.shift },
              { icon: Mail, k: 'Contato', v: person.contact },
            ].map(({ icon: Icon, k, v }) => (
              <div key={k} className="flex items-center gap-3">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-orange-light text-orange">
                  <Icon size={15} />
                </span>
                <div>
                  <dt className="text-xs text-ink-muted">{k}</dt>
                  <dd className="text-sm font-semibold text-ink">{v}</dd>
                </div>
              </div>
            ))}
          </dl>

          {person.quote && (
            <div className="mt-6 rounded-lg bg-bg-secondary p-4">
              <Quote size={18} className="mb-1 text-orange/50" />
              <p className="text-sm italic leading-relaxed text-ink-secondary">“{person.quote}”</p>
            </div>
          )}

          <Link to="/time" className="btn-ghost mt-6 w-fit">
            <ArrowLeft size={15} /> Voltar para o Time
          </Link>
        </div>
      </div>
    </>
  )
}
