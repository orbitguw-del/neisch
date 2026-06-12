import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const VAPID_PUBLIC_KEY = 'BG38xEPpM8xpZxZREdEigyeWtirH1U819T1dnMPhFsNArAglMb7okZAiBkOttOl93HdmZDdQ8UWnaqR2kP3lgSQ'

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4)
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/')
  const raw = window.atob(base64)
  return Uint8Array.from([...raw].map(c => c.charCodeAt(0)))
}

const useNotificationStore = create((set, get) => ({
  notifications:  [],
  unreadCount:    0,
  loading:        false,
  pushEnabled:    false,

  fetch: async (userId) => {
    if (!userId) return
    set({ loading: true })
    const { data } = await supabase
      .from('notifications')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(30)
    const list = data ?? []
    set({
      notifications: list,
      unreadCount:   list.filter(n => !n.read_at).length,
      loading:       false,
    })
  },

  markAllRead: async (userId) => {
    const now = new Date().toISOString()
    await supabase
      .from('notifications')
      .update({ read_at: now })
      .eq('user_id', userId)
      .is('read_at', null)
    set(s => ({
      notifications: s.notifications.map(n => ({ ...n, read_at: n.read_at ?? now })),
      unreadCount: 0,
    }))
  },

  markRead: async (notifId) => {
    const now = new Date().toISOString()
    await supabase.from('notifications').update({ read_at: now }).eq('id', notifId)
    set(s => ({
      notifications: s.notifications.map(n => n.id === notifId ? { ...n, read_at: now } : n),
      unreadCount: Math.max(0, s.unreadCount - 1),
    }))
  },

  // Subscribe to real-time new notifications
  subscribe: (userId) => {
    return supabase
      .channel(`notifications:${userId}`)
      .on('postgres_changes', {
        event: 'INSERT', schema: 'public', table: 'notifications',
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        const n = payload.new
        set(s => ({
          notifications: [n, ...s.notifications],
          unreadCount: s.unreadCount + 1,
        }))
      })
      .subscribe()
  },

  // Request permission + register push subscription
  enablePush: async (userId) => {
    if (!('serviceWorker' in navigator) || !('PushManager' in window)) return false
    const permission = await Notification.requestPermission()
    if (permission !== 'granted') return false

    const reg = await navigator.serviceWorker.ready
    const sub = await reg.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: urlBase64ToUint8Array(VAPID_PUBLIC_KEY),
    })
    const json = sub.toJSON()
    await supabase.from('push_subscriptions').upsert({
      user_id:  userId,
      endpoint: json.endpoint,
      p256dh:   json.keys.p256dh,
      auth_key: json.keys.auth,
    }, { onConflict: 'user_id,endpoint' })

    set({ pushEnabled: true })
    return true
  },

  checkPushEnabled: async () => {
    if (!('Notification' in window)) return
    set({ pushEnabled: Notification.permission === 'granted' })
  },
}))

export default useNotificationStore

// Helper: create a notification row (called from other stores/pages).
// Goes through the SECURITY DEFINER create_notification RPC, which stamps
// tenant_id from the caller's auth context and verifies the target is in the
// same tenant — so the client can't forge tenant or spoof arbitrary rows.
// `tenantId` is accepted for call-site compatibility but no longer trusted/sent.
export async function createNotification({ tenantId, userId, title, body, type, entityId, entityType }) {
  await supabase.rpc('create_notification', {
    p_user_id:     userId,
    p_title:       title,
    p_body:        body ?? null,
    p_type:        type ?? 'general',
    p_entity_id:   entityId ?? null,
    p_entity_type: entityType ?? null,
  })
}
