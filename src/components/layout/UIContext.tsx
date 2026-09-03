import { createContext, useContext, useMemo, useState, type ReactNode } from 'react'
import { notifications as SEED } from '@/data/misc'
import type { Notification } from '@/types'

const READ_KEY = 'spxr_notif_read_v1'

function loadReadIds(): string[] {
  try {
    const raw = localStorage.getItem(READ_KEY)
    return raw ? (JSON.parse(raw) as string[]) : []
  } catch {
    return []
  }
}
function saveReadIds(ids: string[]) {
  try {
    localStorage.setItem(READ_KEY, JSON.stringify(ids))
  } catch {
    /* ignore */
  }
}

interface UIState {
  searchOpen: boolean
  openSearch: () => void
  closeSearch: () => void

  notifOpen: boolean
  toggleNotif: () => void
  closeNotif: () => void
  notifItems: Notification[]
  unreadCount: number
  dismissNotif: (id: string) => void
  markAllNotifRead: () => void

  menuOpen: boolean
  openMenu: () => void
  closeMenu: () => void
}

const UICtx = createContext<UIState | null>(null)

export function UIProvider({ children }: { children: ReactNode }) {
  const [searchOpen, setSearchOpen] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  const [notifOpen, setNotifOpen] = useState(false)
  const [readIds, setReadIds] = useState<string[]>(loadReadIds)
  // ids que continuam visíveis nesta abertura mesmo após marcados como lidos
  const [sessionVisible, setSessionVisible] = useState<string[]>([])

  function persistRead(ids: string[]) {
    setReadIds(ids)
    saveReadIds(ids)
  }

  // badge = notificações ainda não lidas
  const unreadCount = useMemo(
    () => SEED.filter((n) => !readIds.includes(n.id)).length,
    [readIds],
  )

  // lista mostrada: não lidas + as que estavam abertas nesta sessão
  const notifItems = useMemo(
    () =>
      SEED.filter((n) => !readIds.includes(n.id) || sessionVisible.includes(n.id)).map((n) => ({
        ...n,
        read: readIds.includes(n.id),
      })),
    [readIds, sessionVisible],
  )

  function openNotif() {
    // ao visualizar: mantém as atuais visíveis nesta sessão e marca todas como lidas
    const unread = SEED.filter((n) => !readIds.includes(n.id)).map((n) => n.id)
    setSessionVisible(unread)
    if (unread.length) persistRead([...readIds, ...unread])
    setNotifOpen(true)
  }

  function closeNotif() {
    setNotifOpen(false)
    // ao fechar, as lidas somem da lista (reduz na próxima abertura)
    setSessionVisible([])
  }

  function dismissNotif(id: string) {
    if (!readIds.includes(id)) persistRead([...readIds, id])
    setSessionVisible((prev) => prev.filter((x) => x !== id))
  }

  function markAllNotifRead() {
    persistRead(SEED.map((n) => n.id))
    setSessionVisible([])
  }

  return (
    <UICtx.Provider
      value={{
        searchOpen,
        openSearch: () => setSearchOpen(true),
        closeSearch: () => setSearchOpen(false),

        notifOpen,
        toggleNotif: () => (notifOpen ? closeNotif() : openNotif()),
        closeNotif,
        notifItems,
        unreadCount,
        dismissNotif,
        markAllNotifRead,

        menuOpen,
        openMenu: () => setMenuOpen(true),
        closeMenu: () => setMenuOpen(false),
      }}
    >
      {children}
    </UICtx.Provider>
  )
}

export function useUI() {
  const ctx = useContext(UICtx)
  if (!ctx) throw new Error('useUI must be used within UIProvider')
  return ctx
}
