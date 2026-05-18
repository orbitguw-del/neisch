// Helper used by stores to make a write offline-capable.
//
// When online, the store runs its normal Supabase call.
// When offline, the store calls queueWrite() to persist the mutation, then
// adds an optimistic record (flagged `_pending`) to its own state so the UI
// updates immediately. The sync engine replays the mutation on reconnect.
import useOfflineStore from '@/stores/offlineStore'
import { enqueue } from '@/lib/offlineQueue'

/** Is the app currently online? */
export function isOnline() {
  return useOfflineStore.getState().online
}

/** Persist a mutation to the offline queue and refresh the pending count. */
export async function queueWrite(mutation) {
  const rec = await enqueue(mutation)
  await useOfflineStore.getState().refreshPendingCount()
  return rec
}

/** Temporary client-side id for an optimistic, not-yet-synced record. */
export function offlineId() {
  return `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`
}
