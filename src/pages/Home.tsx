import Hero from '@/components/home/Hero'
import ReversaNow from '@/components/home/ReversaNow'
import QuickAccess from '@/components/home/QuickAccess'
import WeekModel from '@/components/home/WeekModel'
import ProjectProgress from '@/components/home/ProjectProgress'
import HomeJourney from '@/components/home/HomeJourney'
import PeopleSpotlight from '@/components/home/PeopleSpotlight'
import AgendaCard from '@/components/home/AgendaCard'
import AnnouncementsCard from '@/components/home/AnnouncementsCard'
import QuickLinksCard from '@/components/home/QuickLinksCard'
import NewsCard from '@/components/ui/NewsCard'
import SectionHeader from '@/components/ui/SectionHeader'
import { getNews } from '@/data/content'
import { useAsync } from '@/lib/useAsync'

export default function Home() {
  const { data: news } = useAsync(getNews, [])
  const latestNews = [...(news ?? [])].sort((a, b) => b.date.localeCompare(a.date))

  return (
    <div className="portal-container space-y-4 py-4 sm:py-6">
      {/* Row 1 — Hero + Reversa Agora + Acessos Rápidos */}
      <section className="grid gap-4 lg:grid-cols-12">
        <div className="lg:col-span-6">
          <Hero />
        </div>
        <div className="lg:col-span-3">
          <ReversaNow />
        </div>
        <div className="lg:col-span-3">
          <QuickAccess />
        </div>
      </section>

      {/* Row 2 — Últimas novidades */}
      <section>
        <SectionHeader title="Últimas Novidades" linkLabel="Ver todas" linkTo="/novidades" />
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {latestNews.slice(0, 3).map((article) => (
            <NewsCard key={article.id} article={article} />
          ))}
        </div>
      </section>

      {/* Row 3 — Modelo, Projetos, Jornada */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        <WeekModel />
        <ProjectProgress />
        <HomeJourney />
      </section>

      {/* Row 4 — Pessoas, Agenda, Comunicados, Links */}
      <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <PeopleSpotlight />
        <AgendaCard />
        <AnnouncementsCard />
        <QuickLinksCard />
      </section>
    </div>
  )
}
