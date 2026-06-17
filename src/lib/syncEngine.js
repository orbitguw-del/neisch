// Drains the offline mutation queue against Supabase and wires connectivity
// detection. initOfflineSync() is called once at app start.
import { Network } from '@capacitor/network'
import { supabase } from '@/lib/supabase'
import { getQueued, removeMutation, markFailed } from '@/lib/offlineQueue'
import useOfflineStore from '@/stores/offlineStore'
import { invalidateCache } from '@/lib/offlineCache'

const INVALIDATION_MAP = {
  attendance:          ['worker:'],
  daily_logs:          ['dailyLog:'],
  site_expenses:       ['expense:'],
  workers:             ['worker:'],
  sites:               ['site:'],
  materials:           ['material:'],
  material_receipts:   ['materialReceipt:', 'material:'],
  material_transfers:  ['materialTransfer:', 'material:'],
  tasks:               ['task:'],
  site_assignments:    ['assignment:'],
}

/** Replay one queued mutation against Supabase. Throws on error. */
async function applyMutation(m) {
  if (m.op === 'insert') {
    const { error } = await supabase.from(m.table).insert(m.payload)
    if (error) throw error
  } else if (m.op === 'update') {
    let q = supabase.from(m.table).update(m.payload)
    for (const [k, v] of Object.entries(m.match ?? {})) q = q.eq(k, v)
    const { error } = await q
    if (error) throw error
  } else if (m.op === 'upsert') {
    const { error } = await supabase.from(m.table).upsert(m.payload, m.upsertOpts)
    if (error) throw error
  } else if (m.op === 'storage') {
    const { error } = await supabase.storage
      .from(m.bucket)
      .upload(m.path, m.blob, { contentType: m.contentType ?? 'image/jpeg', upsert: true })
    if (error) throw error
  } else {
    throw new Error(`Unknown offline op: ${m.op}`)
  }
}

let draining = false

/**
 * Replay every queued mutation in order. Successful ones are removed;
 * failures are flagged and left in place for the user to review.
 */
export async function drainQueue() {
  const store = useOfflineStore.getState()
  if (draining || !store.online) return

  draining = true
  store.setSyncing(true)
  try {
    const queued = await getQueued()
    for (const m of queued) {
      if (m.status === 'failed') continue   // already surfaced — don't auto-retry
      try {
        await applyMutation(m)
        await removeMutation(m.id)
        const prefixes = INVALIDATION_MAP[m.table]
        if (prefixes) {
          for (const p of prefixes) await invalidateCache(p)
        }
      } catch (err) {
        const msg = err?.message ?? String(err)
        await markFailed(m.id, msg)
        store.setLastSyncError(msg)
      }
    }
  } finally {
    draining = false
    store.setSyncing(false)
    await store.refreshPendingCount()
  }
}

/**
 * Initialise connectivity detection. Called once from main.jsx.
 * Updates the offline store and drains the queue whenever the app
 * regains connectivity.
 */
export async function initOfflineSync() {
  const store = useOfflineStore.getState()

  // Seed initial state.
  try {
    const status = await Network.getStatus()
    store.setOnline(status.connected)
  } catch {
    store.setOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)
  }
  await store.refreshPendingCount()

  // React to connectivity changes.
  Network.addListener('networkStatusChange', (status) => {
    const was = useOfflineStore.getState().online
    store.setOnline(status.connected)
    if (status.connected && !was) {
      // Just came back online — flush the queue.
      drainQueue()
    }
  })

  // If we start online with a non-empty queue, flush it now.
  if (useOfflineStore.getState().online) {
    drainQueue()
  }
}
