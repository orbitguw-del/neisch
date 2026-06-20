import { getCached, setCache } from '@/lib/offlineCache'
import useOfflineStore from '@/stores/offlineStore'

const QUERY_TIMEOUT_MS = 15000

function isOnline() {
  return useOfflineStore.getState().online
}

export function cacheKey(store, fn, params) {
  const sorted = Object.entries(params)
    .filter(([, v]) => v != null)
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([k, v]) => `${k}=${v}`)
    .join('&')
  return `${store}:${fn}:${sorted}`
}

// Races a query against a 15-second deadline. On spotty 4G the TCP connection
// can hang indefinitely — without this the loading spinner never clears.
async function runWithTimeout(queryFn) {
  let timer
  const timeout = new Promise((_, reject) => {
    timer = setTimeout(() => reject(new Error('Network request timed out — check your connection')), QUERY_TIMEOUT_MS)
  })
  try {
    return await Promise.race([queryFn(), timeout])
  } finally {
    clearTimeout(timer)
  }
}

export async function withCache(storeName, fnName, params, queryFn, setFn) {
  const key = cacheKey(storeName, fnName, params)

  const cached = await getCached(key)
  if (cached) setFn(cached.data)

  if (isOnline()) {
    try {
      const fresh = await runWithTimeout(queryFn)
      setFn(fresh)
      await setCache(key, fresh)
    } catch (err) {
      if (!cached) throw err
      // Cached data already served above — swallow the error silently.
    }
  }
  // Offline + no cache → silently no-op. The caller's default (empty list,
  // empty map, previous state) is the right UX — a brand-new date or empty
  // table should render as "nothing yet", not block the page with an error.
}
