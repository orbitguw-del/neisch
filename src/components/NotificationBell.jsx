import { useEffect, useRef, useState } from 'react'
import { Bell, Check, BellRing, X } from 'lucide-react'
import useNotificationStore from '@/stores/notificationStore'
import useAuthStore from '@/stores/authStore'

const TYPE_CONFIG = {
  task_assigned:   { emoji: '📋', color: 'bg-blue-50 border-blue-100' },
  log_confirmed:   { emoji: '✅', color: 'bg-green-50 border-green-100' },
  transfer_pending:{ emoji: '🔄', color: 'bg-amber-50 border-amber-100' },
  general:         { emoji: '🔔', color: 'bg-gray-50 border-gray-100' },
}

function timeAgo(iso) {
  const diff = Date.now() - new Date(iso).getTime()
  const m = Math.floor(diff / 60000)
  if (m < 1)  return 'just now'
  if (m < 60) return `${m}m ago`
  const h = Math.floor(m / 60)
  if (h < 24) return `${h}h ago`
  return `${Math.floor(h / 24)}d ago`
}

export default function NotificationBell() {
  const { user, profile } = useAuthStore()
  const { notifications, unreadCount, loading, fetch, markAllRead, markRead, subscribe, enablePush, checkPushEnabled, pushEnabled } = useNotificationStore()
  const [open, setOpen]     = useState(false)
  const panelRef            = useRef(null)
  const channelRef          = useRef(null)

  useEffect(() => {
    if (!user?.id) return
    fetch(user.id)
    checkPushEnabled()
    channelRef.current = subscribe(user.id)
    return () => { channelRef.current?.unsubscribe() }
  }, [user?.id]) // eslint-disable-line react-hooks/exhaustive-deps

  // Close on outside click
  useEffect(() => {
    if (!open) return
    const handler = (e) => { if (panelRef.current && !panelRef.current.contains(e.target)) setOpen(false) }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [open])

  const handleOpen = () => {
    setOpen(o => !o)
    if (!open && unreadCount > 0) markAllRead(user.id)
  }

  const handleEnablePush = async () => {
    const ok = await enablePush(user.id)
    if (!ok) alert('Could not enable notifications. Please allow notifications in your browser settings.')
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={handleOpen}
        className="relative flex h-9 w-9 items-center justify-center rounded-xl text-gray-500 hover:bg-gray-100 transition-colors"
      >
        {unreadCount > 0 ? <BellRing className="h-5 w-5 text-brand-600" /> : <Bell className="h-5 w-5" />}
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-brand-600 text-[9px] font-bold text-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Panel */}
      {open && (
        <div className="absolute right-0 top-11 z-50 w-80 rounded-2xl bg-white shadow-2xl border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-gray-100">
            <h3 className="text-sm font-bold text-gray-900">Notifications</h3>
            <button onClick={() => setOpen(false)} className="rounded-lg p-1 text-gray-400 hover:bg-gray-100">
              <X className="h-3.5 w-3.5" />
            </button>
          </div>

          {/* Push permission prompt */}
          {!pushEnabled && 'Notification' in window && Notification.permission !== 'denied' && (
            <div className="mx-3 mt-3 rounded-xl bg-brand-50 border border-brand-100 px-3 py-2.5 flex items-center gap-2">
              <BellRing className="h-4 w-4 text-brand-600 shrink-0" />
              <p className="text-xs text-brand-700 flex-1">Get notified even when the app is closed</p>
              <button onClick={handleEnablePush}
                className="shrink-0 rounded-lg bg-brand-600 px-2.5 py-1 text-xs font-semibold text-white hover:bg-brand-700">
                Enable
              </button>
            </div>
          )}

          {/* List */}
          <div className="max-h-80 overflow-y-auto">
            {loading ? (
              <p className="py-8 text-center text-sm text-gray-400">Loading…</p>
            ) : notifications.length === 0 ? (
              <div className="py-10 text-center">
                <Bell className="mx-auto h-8 w-8 text-gray-200 mb-2" />
                <p className="text-sm text-gray-400">No notifications yet</p>
              </div>
            ) : (
              notifications.map(n => {
                const cfg = TYPE_CONFIG[n.type] ?? TYPE_CONFIG.general
                return (
                  <div
                    key={n.id}
                    onClick={() => !n.read_at && markRead(n.id)}
                    className={`flex gap-3 px-4 py-3 border-b border-gray-50 transition-colors ${
                      n.read_at ? 'opacity-60' : 'bg-brand-50/30 cursor-pointer hover:bg-brand-50/50'
                    }`}
                  >
                    <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border text-base ${cfg.color}`}>
                      {cfg.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-gray-900 leading-snug">{n.title}</p>
                      {n.body && <p className="text-xs text-gray-500 mt-0.5 leading-snug">{n.body}</p>}
                      <p className="text-xs text-gray-400 mt-1">{timeAgo(n.created_at)}</p>
                    </div>
                    {!n.read_at && <div className="mt-2 h-2 w-2 shrink-0 rounded-full bg-brand-600" />}
                  </div>
                )
              })
            )}
          </div>
        </div>
      )}
    </div>
  )
}
