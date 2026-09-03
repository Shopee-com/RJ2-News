import { useEffect } from 'react'
import { X, Check, FileText, Megaphone, GraduationCap, RefreshCw, FolderKanban, Award, BellOff } from 'lucide-react'
import { useUI } from './UIContext'
import type { NotificationType } from '@/types'

const ICONS: Record<NotificationType, typeof FileText> = {
  'Novo POP': FileText,
  Atualização: RefreshCw,
  Comunicado: Megaphone,
  Treinamento: GraduationCap,
  Projeto: FolderKanban,
  Reconhecimento: Award,
}

export default function NotificationPanel() {
  const { notifOpen, closeNotif, notifItems, unreadCount, dismissNotif, markAllNotifRead } = useUI()

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') closeNotif()
    }
    if (notifOpen) document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [notifOpen, closeNotif])

  if (!notifOpen) return null

  return (
    <>
      <div className="fixed inset-0 z-[60]" onClick={closeNotif} aria-hidden />
      <div
        className="fixed right-2 top-16 z-[61] w-[calc(100vw-1rem)] max-w-sm overflow-hidden rounded-card border border-line bg-white shadow-panel animate-fade-in sm:right-6"
        role="dialog"
        aria-label="Notificações"
      >
        <div className="flex items-center justify-between border-b border-line px-4 py-3">
          <div className="flex items-center gap-2">
            <h3 className="text-sm font-bold text-ink">Notificações</h3>
            {unreadCount > 0 && (
              <span className="rounded-full bg-orange px-1.5 py-0.5 text-[10px] font-bold text-white">
                {unreadCount}
              </span>
            )}
          </div>
          <div className="flex items-center gap-3">
            {notifItems.length > 0 && (
              <button
                onClick={markAllNotifRead}
                className="flex items-center gap-1 text-xs font-semibold text-orange hover:text-orange-hover"
              >
                <Check size={13} /> Marcar todas
              </button>
            )}
            <button onClick={closeNotif} aria-label="Fechar" className="text-ink-muted hover:text-ink">
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="max-h-[60vh] overflow-y-auto">
          {notifItems.length === 0 ? (
            <div className="flex flex-col items-center gap-2 px-4 py-12 text-center text-ink-muted">
              <BellOff size={26} />
              <p className="text-sm">Nenhuma notificação nova.</p>
            </div>
          ) : (
            notifItems.map((n) => {
              const Icon = ICONS[n.type]
              return (
                <div
                  key={n.id}
                  className={`flex w-full items-start gap-3 border-b border-line px-4 py-3 last:border-0 ${
                    n.read ? '' : 'bg-orange-light/50'
                  }`}
                >
                  <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-orange-light text-orange">
                    <Icon size={15} />
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="mb-0.5 block text-label font-bold uppercase tracking-wide text-orange">
                      {n.type}
                    </span>
                    <span className="block text-sm font-medium leading-snug text-ink">{n.title}</span>
                    <span className="mt-0.5 block text-xs text-ink-muted">{n.time}</span>
                  </span>
                  <button
                    onClick={() => dismissNotif(n.id)}
                    aria-label="Dispensar"
                    className="mt-0.5 shrink-0 rounded p-1 text-ink-muted hover:bg-bg-secondary hover:text-danger"
                  >
                    <X size={14} />
                  </button>
                </div>
              )
            })
          )}
        </div>
      </div>
    </>
  )
}
