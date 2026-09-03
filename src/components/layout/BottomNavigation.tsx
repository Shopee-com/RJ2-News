import { NavLink } from 'react-router-dom'
import { Home, Newspaper, BarChart3, Menu } from 'lucide-react'
import { useUI } from './UIContext'
import { useNavEntries } from '@/lib/useNav'

const ALL = [
  { to: '/', icon: Home },
  { to: '/novidades', icon: Newspaper },
  { to: '/dados', icon: BarChart3 },
]

export default function BottomNavigation() {
  const { openMenu } = useUI()
  const entries = useNavEntries()
  const items = ALL.map((i) => {
    const e = entries.find((x) => x.to === i.to)
    return { ...i, label: e?.label ?? '', visible: i.to === '/' || (e?.visible ?? true) }
  }).filter((i) => i.visible)
  const cols = items.length + 1

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 backdrop-blur lg:hidden"
      aria-label="Navegação inferior"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      <div className="grid" style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}>
        {items.map(({ label, to, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            end={to === '/'}
            className={({ isActive }) =>
              `flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium ${
                isActive ? 'text-orange' : 'text-ink-muted'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={`flex h-7 w-11 items-center justify-center rounded-full ${
                    isActive ? 'bg-orange-light' : ''
                  }`}
                >
                  <Icon size={20} />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
        <button
          onClick={openMenu}
          className="flex min-h-[56px] flex-col items-center justify-center gap-1 text-[11px] font-medium text-ink-muted"
        >
          <span className="flex h-7 w-11 items-center justify-center rounded-full">
            <Menu size={20} />
          </span>
          Menu
        </button>
      </div>
    </nav>
  )
}
