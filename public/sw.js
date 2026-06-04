// Minimal service worker — required for PWA install prompt to fire.
// Storey uses Supabase for data; no offline caching strategy needed here.
const CACHE = 'storey-shell-v1'

self.addEventListener('install', () => self.skipWaiting())
self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  )
})

// Network-first: always go to network, fall back to cache for the shell only.
self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return
  const url = new URL(e.request.url)
  // Only cache same-origin HTML shell
  if (url.origin !== location.origin) return
  e.respondWith(
    fetch(e.request).catch(() => caches.match('/index.html'))
  )
})
