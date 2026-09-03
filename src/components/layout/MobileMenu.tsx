import { NavLink, useNavigate } from 'react-router-dom'
import { X, LogOut, LogIn, LayoutDashboard, ChevronRight, UserCircle } from 'lucide-react'
import { useUI } from './UIContext'
import { useAuth } from '@/lib/auth'
import { QUICK_LINKS_NAV } from '@/lib/nav'
import { useVisibleNav } from '@/lib/useNav'
import { avatar } from '@/lib/media'

export default function MobileMenu() {
  const { menuOpen, closeMenu } = useUI()
  const { session, isAdmin, profile, signOut } = useAuth()
  const navItems = useVisibleNav()
  const navigate = useNavigate()

  return (
    <>
      <div
        className={`fixed inset-0 z-[65] bg-black/50 transition-opacity duration-200 lg:hidden ${
          menuOpen ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
        onClick={closeMenu}
        aria-hidden
      />
      <aside
        className={`fixed inset-y-0 left-0 z-[66] w-[82vw] max-w-xs overflow-y-auto bg-dark text-white transition-transform duration-200 lg:hidden ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-label="Menu"
      >
        <div className="flex items-center justify-between border-b border-white/10 p-4">
          <NavLink to="/perfil" onClick={closeMenu} className="flex items-center gap-3">
            <img src={profile?.photo || avatar(session ? 'user-me' : 'guest', 80)} alt="" className="h-10 w-10 rounded-lg object-cover" />
            <div className="leading-tight">
              <p className="text-sm font-semibold">{session ? (profile?.name || (isAdmin ? 'Administrador' : 'Minha Conta')) : 'Visitante'}</p>
              <p className="max-w-[10rem] truncate text-xs text-on-dark-secondary">{profile?.opsid ? `OpsID: ${profile.opsid}` : profile?.email ?? 'Reversa'}</p>
            </div>
          </NavLink>
          <button onClick={closeMenu} aria-label="Fechar menu" className="text-on-dark-secondary hover:text-white">
            <X size={20} />
          </button>
        </div>

        <nav className="p-2" aria-label="Navegação">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/'}
              onClick={closeMenu}
              className={({ isActive }) =>
                `flex items-center justify-between rounded-lg px-3 py-3 text-sm font-medium ${
                  isActive ? 'bg-orange/15 text-orange' : 'text-on-dark-secondary hover:bg-white/5 hover:text-white'
                }`
              }
            >
              {item.label}
              <ChevronRight size={16} className="opacity-50" />
            </NavLink>
          ))}
        </nav>

        <div className="mt-2 border-t border-white/10 p-2">
          <p className="px-3 py-2 text-label font-bold uppercase tracking-wide text-on-dark-secondary">
            Links rápidos
          </p>
          {QUICK_LINKS_NAV.map((item) => (
            <NavLink
              key={item.label}
              to={item.to}
              onClick={closeMenu}
              className="block rounded-lg px-3 py-2.5 text-sm text-on-dark-secondary hover:bg-white/5 hover:text-white"
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="mt-2 border-t border-white/10 p-2 pb-8">
          {session && (
            <NavLink
              to="/perfil"
              onClick={closeMenu}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-on-dark-secondary hover:bg-white/5 hover:text-white"
            >
              <UserCircle size={16} /> Meu perfil
            </NavLink>
          )}
          {isAdmin && (
            <NavLink
              to="/admin"
              onClick={closeMenu}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-on-dark-secondary hover:bg-white/5 hover:text-white"
            >
              <LayoutDashboard size={16} /> Painel administrativo
            </NavLink>
          )}
          {session ? (
            <button
              onClick={async () => {
                await signOut()
                closeMenu()
                navigate('/')
              }}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-on-dark-secondary hover:bg-white/5 hover:text-white"
            >
              <LogOut size={16} /> Sair
            </button>
          ) : (
            <NavLink
              to="/login"
              onClick={closeMenu}
              className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm text-on-dark-secondary hover:bg-white/5 hover:text-white"
            >
              <LogIn size={16} /> Entrar
            </NavLink>
          )}
        </div>
      </aside>
    </>
  )
}
