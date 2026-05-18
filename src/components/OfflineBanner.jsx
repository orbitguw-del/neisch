import { CloudOff, RefreshCw, AlertTriangle } from 'lucide-react'
import useOfflineStore from '@/stores/offlineStore'
import { drainQueue } from '@/lib/syncEngine'

// Thin status strip shown under the header. Visible only when the app is
// offline or has unsynced changes — silent the rest of the time.
export default function OfflineBanner() {
  const { online, pendingCount, syncing, lastSyncError } = useOfflineStore()

  if (online && pendingCount === 0) return null

  // Offline
  if (!online) {
    return (
      <div className="no-print border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-800 flex items-center gap-2">
        <CloudOff className="h-4 w-4 flex-shrink-0" />
        <span className="flex-1">
          You're offline. Attendance, daily logs and expenses are saved on this
          device{pendingCount > 0 ? ` (${pendingCount} waiting to sync)` : ''} and
          will sync automatically when you reconnect.
        </span>
      </div>
    )
  }

  // Online but queue not empty
  return (
    <div className="no-print border-b border-blue-200 bg-blue-50 px-6 py-2 text-sm text-blue-800 flex items-center gap-2">
      {syncing ? (
        <RefreshCw className="h-4 w-4 flex-shrink-0 animate-spin" />
      ) : lastSyncError ? (
        <AlertTriangle className="h-4 w-4 flex-shrink-0 text-amber-600" />
      ) : (
        <RefreshCw className="h-4 w-4 flex-shrink-0" />
      )}
      <span className="flex-1">
        {syncing
          ? `Syncing ${pendingCount} offline change${pendingCount === 1 ? '' : 's'}…`
          : lastSyncError
            ? `${pendingCount} change${pendingCount === 1 ? '' : 's'} couldn't sync: ${lastSyncError}`
            : `${pendingCount} offline change${pendingCount === 1 ? '' : 's'} waiting to sync.`}
      </span>
      {!syncing && (
        <button
          type="button"
          onClick={() => drainQueue()}
          className="font-medium underline hover:text-blue-900"
        >
          Sync now
        </button>
      )}
    </div>
  )
}
