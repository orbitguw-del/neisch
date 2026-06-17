import { openDB } from 'idb'

const DB_NAME = 'storey-cache'
const STORE = 'responses'
const CACHE_VERSION = 1

let dbPromise = null
function db() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(d) {
        d.createObjectStore(STORE, { keyPath: 'key' })
      },
    })
  }
  return dbPromise
}

export async function getCached(key) {
  try {
    const d = await db()
    const rec = await d.get(STORE, key)
    if (!rec || rec.version !== CACHE_VERSION) return null
    return { data: rec.data, cachedAt: rec.cachedAt }
  } catch {
    return null
  }
}

export async function setCache(key, data) {
  try {
    const d = await db()
    await d.put(STORE, { key, data, cachedAt: Date.now(), version: CACHE_VERSION })
  } catch {
    /* IndexedDB unavailable — degrade silently */
  }
}

export async function invalidateCache(prefix) {
  try {
    const d = await db()
    const tx = d.transaction(STORE, 'readwrite')
    let cursor = await tx.store.openCursor()
    while (cursor) {
      if (cursor.key.startsWith(prefix)) cursor.delete()
      cursor = await cursor.continue()
    }
    await tx.done
  } catch {
    /* degrade silently */
  }
}

export async function clearAllCache() {
  try {
    const d = await db()
    await d.clear(STORE)
  } catch {
    /* degrade silently */
  }
}
