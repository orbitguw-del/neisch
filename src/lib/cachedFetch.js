import { getCached, setCache } from '@/lib/offlineCache'
import useOfflineStore from '@/stores/offlineStore'

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

export async function withCache(storeName, fnName, params, queryFn, setFn) {
  const key = cacheKey(storeName, fnName, params)

  const cached = await getCached(key)
  if (cached) setFn(cached.data)

  if (isOnline()) {
    try {
      const fresh = await queryFn()
      setFn(fresh)
      await setCache(key, fresh)
    } catch (err) {
      if (!cached) throw err
    }
  } else if (!cached) {
    throw new Error('You are offline and no cached data is available.')
  }
}
