import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowRight } from 'lucide-react'
import { getNews } from '@/data/content'
import { useAsync } from '@/lib/useAsync'

export default function Hero() {
  const { data: news } = useAsync(getNews, [])
  const [index, setIndex] = useState(0)

  // Destaques marcados; se nenhum, usa as mais recentes
  const slides = useMemo(() => {
    const all = news ?? []
    const featured = all.filter((n) => n.featured)
    const base = featured.length ? featured : all
    return [...base].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 4)
  }, [news])

  useEffect(() => {
    if (slides.length <= 1) return
    const t = setInterval(() => setIndex((i) => (i + 1) % slides.length), 6000)
    return () => clearInterval(t)
  }, [slides.length])

  useEffect(() => {
    if (index >= slides.length) setIndex(0)
  }, [slides.length, index])

  if (slides.length === 0) {
    return (
      <section className="flex h-[320px] items-center justify-center rounded-card bg-bg-secondary sm:h-[340px]">
        <span className="text-sm text-ink-muted">Nenhuma matéria em destaque.</span>
      </section>
    )
  }

  const slide = slides[Math.min(index, slides.length - 1)]

  return (
    <section className="relative h-[320px] overflow-hidden rounded-card sm:h-[340px]" aria-roledescription="carrossel">
      {slides.map((s, i) => (
        <img
          key={s.id}
          src={s.image}
          alt=""
          className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-700 ${
            i === index ? 'opacity-100' : 'opacity-0'
          }`}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-r from-dark/90 via-dark/70 to-dark/30" />

      <div className="relative flex h-full flex-col justify-center p-6 sm:p-8">
        <span className="label-chip mb-3 w-fit rounded bg-orange px-2 py-1 text-white">Destaque</span>
        <h1 className="line-clamp-3 max-w-xl text-2xl font-extrabold leading-tight text-white sm:text-3xl md:text-4xl">
          {slide.title}
        </h1>
        {slide.excerpt && (
          <p className="mt-3 line-clamp-2 max-w-md text-sm text-on-dark-secondary sm:text-base">
            {slide.excerpt}
          </p>
        )}
        <Link to={`/novidades/${slide.slug}`} className="btn-primary mt-5 w-fit">
          Ler matéria completa <ArrowRight size={16} />
        </Link>

        {slides.length > 1 && (
          <div className="mt-6 flex gap-2">
            {slides.map((_, i) => (
              <button
                key={i}
                onClick={() => setIndex(i)}
                aria-label={`Slide ${i + 1}`}
                className={`h-1.5 rounded-full transition-all duration-200 ${
                  i === index ? 'w-6 bg-orange' : 'w-1.5 bg-white/40 hover:bg-white/70'
                }`}
              />
            ))}
          </div>
        )}
      </div>
    </section>
  )
}
