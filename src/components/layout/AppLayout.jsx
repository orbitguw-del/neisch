import { useState } from 'react'
import { Outlet } from 'react-router-dom'
import { AlertTriangle } from 'lucide-react'
import Sidebar from './Sidebar'
import Header from './Header'
import useAuthStore from '@/stores/authStore'

export default function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const { profileError, user, fetchProfile } = useAuthStore()

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50">
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-20 bg-black/50 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <div className="no-print contents">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      </div>

      <div className="flex flex-1 flex-col overflow-hidden">
        <div className="no-print">
          <Header onMenuClick={() => setSidebarOpen(true)} />
        </div>
        {profileError && (
          <div className="no-print border-b border-amber-200 bg-amber-50 px-6 py-2 text-sm text-amber-800 flex items-center gap-2">
            <AlertTriangle className="h-4 w-4 flex-shrink-0" />
            <span className="flex-1">We couldn't load your full profile. Some features may be limited.</span>
            <button
              type="button"
              onClick={() => user?.id && fetchProfile(user.id)}
              className="font-medium underline hover:text-amber-900"
            >
              Retry
            </button>
          </div>
        )}
        <main className="flex-1 overflow-y-auto px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
