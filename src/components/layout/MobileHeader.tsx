import { Menu, Search, Bell } from 'lucide-react'
import Logo from './Logo'
import { useUI } from './UIContext'

export default function MobileHeader() {
  const { openSearch, toggleNotif, openMenu, unreadCount } = useUI()
  const unread = unreadCount

  return (
    <header className="sticky top-0 z-50 bg-dark lg:hidden">
      <div className="flex h-14 items-center justify-between gap-3 px-4">
        <button onClick={openMenu} aria-label="Abrir menu" className="text-white">
          <Menu size={22} />
        </button>

        <Logo withTagline={false} />

        <div className="flex items-center gap-1">
          <button onClick={openSearch} aria-label="Buscar" className="p-2 text-white">
            <Search size={20} />
          </button>
          <button onClick={toggleNotif} aria-label="Notificações" className="relative p-2 text-white">
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute right-0 top-0 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  )
}
