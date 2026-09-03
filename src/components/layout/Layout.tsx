import { useEffect } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { UIProvider } from './UIContext'
import Header from './Header'
import MobileHeader from './MobileHeader'
import MobileMenu from './MobileMenu'
import BottomNavigation from './BottomNavigation'
import Footer from './Footer'
import SearchModal from './SearchModal'
import NotificationPanel from './NotificationPanel'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0 })
  }, [pathname])
  return null
}

export default function Layout() {
  return (
    <UIProvider>
      <ScrollToTop />
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[80] focus:rounded-lg focus:bg-orange focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-white"
      >
        Pular para o conteúdo
      </a>
      <Header />
      <MobileHeader />
      <MobileMenu />
      <SearchModal />
      <NotificationPanel />

      <main id="conteudo" className="min-h-[70vh] pb-20 lg:pb-0">
        <Outlet />
      </main>

      <Footer />
      <BottomNavigation />
    </UIProvider>
  )
}
