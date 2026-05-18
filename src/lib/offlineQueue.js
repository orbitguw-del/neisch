// Offline mutation queue — persists pending writes in IndexedDB so they survive
// app restarts and replay when connectivity returns.
//
// A queued mutation:
//   { id, table, op, payload, match?, upsertOpts?, label?, status, error, createdAt }
//   op      — 'insert' | 'update' | 'upsert'
//   match   — eq filters for 'update' (e.g. { id: '...' })
//   label   — human description for the sync UI (e.g. "Attendance — 12 May")
import { openDB } from 'idb'

const DB_NAME = 'storey-offline'
const STORE   = 'mutations'

let dbPromise = null
function db() {
  if (!dbPromise) {
    dbPromise = openDB(DB_NAME, 1, {
      upgrade(d) {
        const s = d.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true })
        s.createIndex('createdAt', 'createdAt')
      },
    })
  }
  return dbPromise
}

/** Append a mutation to the queue. Returns the stored record (with its id). */
export async function enqueue(mutation) {
  const d = await db()
  const record = {
    ...mutation,
    status:    'pending',
    error:     null,
    createdAt: Date.now(),
  }
  const id = await d.add(STORE, record)
  return { ...record, id }
}

/** All queued mutations, oldest first. */
export async function getQueued() {
  const d = await db()
  return d.getAllFromIndex(STORE, 'createdAt')
}

/** Remove a mutation once it has synced successfully. */
export async function removeMutation(id) {
  const d = await db()
  await d.delete(STORE, id)
}

/** Flag a mutation that failed to sync, so the UI can surface it. */
export async function markFailed(id, error) {
  const d = await db()
  const m = await d.get(STORE, id)
  if (m) {
    m.status = 'failed'
    m.error  = error
    await d.put(STORE, m)
  }
}

/** Number of mutations still queued (pending + failed). */
export async function countPending() {
  const d = await db()
  return d.count(STORE)
}

/** Wipe the queue (used by tests / a manual "discard offline changes" action). */
export async function clearQueue() {
  const d = await db()
  await d.clear(STORE)
}
