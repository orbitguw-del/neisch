// Tracks connectivity + offline-queue state for the whole app.
import { create } from 'zustand'
import { countPending } from '@/lib/offlineQueue'

const useOfflineStore = create((set) => ({
  online:        typeof navigator !== 'undefined' ? navigator.onLine : true,
  pendingCount:  0,        // mutations waiting to sync
  syncing:       false,    // a sync pass is currently running
  lastSyncError: null,     // message from the most recent failed mutation

  setOnline:        (online)        => set({ online }),
  setSyncing:       (syncing)       => set({ syncing }),
  setLastSyncError: (lastSyncError) => set({ lastSyncError }),

  /** Re-read the queued-mutation count from IndexedDB. */
  refreshPendingCount: async () => {
    try {
      set({ pendingCount: await countPending() })
    } catch {
      /* IndexedDB unavailable — leave count as-is */
    }
  },
}))

export default useOfflineStore
