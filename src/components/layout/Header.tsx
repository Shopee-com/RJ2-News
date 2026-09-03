import { NavLink, Link } from 'react-router-dom'
import { Search, Bell, LayoutDashboard, LogOut } from 'lucide-react'
import Logo from './Logo'
import { useUI } from './UIContext'
import { useAuth } from '@/lib/auth'
import { useVisibleNav } from '@/lib/useNav'
import { avatar } from '@/lib/media'

export default function Header() {
  const { openSearch, toggleNotif, unreadCount } = useUI()
  const { session, isAdmin, signOut, profile } = useAuth()
  const navItems = useVisibleNav()
  const unread = unreadCount

  return (
    <header className="sticky top-0 z-50 hidden bg-dark lg:block">
      <div className="portal-container flex h-16 items-center gap-6">
        <Logo />

        <nav className="flex flex-1 items-center justify-center gap-1" aria-label="Principal">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              className={({ isActive }) =>
                `relative px-3 py-5 text-sm font-medium transition-colors duration-200 ${
                  isActive ? 'text-orange' : 'text-on-dark-secondary hover:text-white'
                }`
              }
            >
              {({ isActive }) => (
                <>
                  {item.label}
                  {isActive && (
                    <span className="absolute inset-x-3 bottom-0 h-0.5 rounded-full bg-orange" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <button
            onClick={openSearch}
            className="flex h-9 w-52 items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 text-sm text-on-dark-secondary transition-colors hover:border-white/20 xl:w-64"
            aria-label="Buscar no portal"
          >
            <Search size={15} />
            <span className="truncate">Buscar no portal...</span>
          </button>

          <button
            onClick={toggleNotif}
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-on-dark-secondary transition-colors hover:text-white"
            aria-label={`Notificações${unread ? `, ${unread} não lidas` : ''}`}
          >
            <Bell size={17} />
            {unread > 0 && (
              <span className="absolute -right-1 -top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-orange px-1 text-[10px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>

          {isAdmin && (
            <Link
              to="/admin"
              className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-on-dark-secondary transition-colors hover:text-white"
            >
              <LayoutDashboard size={15} /> Admin
            </Link>
          )}
          {session && (
            <>
              <Link to="/perfil" aria-label="Meu perfil">
                <img
                  src={profile?.photo || avatar('user-me', 64)}
                  alt=""
                  className="h-8 w-8 rounded-lg object-cover ring-1 ring-white/10 transition-transform hover:scale-105"
                />
              </Link>
              <button
                onClick={signOut}
                className="flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-xs font-semibold text-on-dark-secondary transition-colors hover:text-white"
                aria-label="Sair"
              >
                <LogOut size={15} /> Sair
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
