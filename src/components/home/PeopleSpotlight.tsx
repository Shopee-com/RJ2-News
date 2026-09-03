import { useState } from 'react'
import { Quote } from 'lucide-react'
import { getPeople } from '@/data/content'
import { useAsync } from '@/lib/useAsync'
import SectionHeader from '@/components/ui/SectionHeader'

export default function PeopleSpotlight() {
  const { data } = useAsync(getPeople, [])
  const SPOTLIGHT = (data ?? []).filter((p) => p.quote)
  const [index, setIndex] = useState(0)
  const person = SPOTLIGHT[index]

  if (!person) return null

  return (
    <div className="card flex h-full flex-col p-5">
      <SectionHeader title="Pessoas que fazem a Reversa" linkLabel="Ver todos" linkTo="/time" />
      <div className="flex flex-1 flex-col items-center text-center">
        <img
          src={person.photo}
          alt={person.name}
          className="h-16 w-16 rounded-full object-cover ring-2 ring-orange-light"
        />
        <h3 className="mt-3 text-sm font-bold text-ink">{person.name}</h3>
        <p className="text-xs text-orange">{person.role}</p>
        <div className="relative mt-3 px-2">
          <Quote size={16} className="mx-auto mb-1 text-orange/40" />
          <p className="text-sm italic leading-relaxed text-ink-secondary">“{person.quote}”</p>
        </div>
      </div>
      <div className="mt-4 flex justify-center gap-1.5">
        {SPOTLIGHT.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            aria-label={`Depoimento ${i + 1}`}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-5 bg-orange' : 'w-1.5 bg-line'}`}
          />
        ))}
      </div>
    </div>
  )
}
