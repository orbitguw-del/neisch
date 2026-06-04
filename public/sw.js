// Service worker — PWA shell cache + web push notifications
const CACHE = 'storey-shell-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Network-first for same-origin requests; fallback to shell
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  if (url.origin !== location.origin) return
  e.respondWith(fetch(e.request).catch(() => caches.match('/index.html')))
})

// ── Web push ──────────────────────────────────────────────────────────────────
self.addEventListener('push', (e) => {
  if (!e.data) return
  let payload = { title: 'Storey', body: 'You have a new update.' }
  try { payload = e.data.json() } catch {}

  e.waitUntil(
    self.registration.showNotification(payload.title, {
      body:    payload.body,
      icon:    '/icons/icon-192.png',
      badge:   '/icons/icon-192.png',
      data:    payload,
      vibrate: [100, 50, 100],
    })
  )
})

self.addEventListener('notificationclick', (e) => {
  e.notification.close()
  const url = e.notification.data?.url ?? '/'
  e.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      const existing = list.find(c => c.url.includes(location.origin) && 'focus' in c)
      if (existing) return existing.focus()
      return clients.openWindow(url)
    })
  )
})
