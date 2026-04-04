import { Bell, ChevronDown, LogOut, User } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import { initials } from '@/lib/utils'

const ROLE_LABELS = {
  superadmin:   'Super Admin',
  contractor:   'Contractor',
  site_manager: 'Site Manager',
  supervisor:   'Supervisor',
  store_keeper: 'Store Keeper',
}

const AVATAR_COLORS = {
  superadmin:   'bg-purple-600',
  contractor:   'bg-brand-600',
  site_manager: 'bg-earth-600',
  supervisor:   'bg-green-600',
  store_keeper: 'bg-yellow-600',
}

export default function Header() {
  const [open, setOpen] = useState(false)
  const navigate = useNavigate()
  const { profile, session, signOut } = useAuthStore()

  // Fix: fall back to session.user.email (profiles table has no email column)
  const name = profile?.full_name ?? session?.user?.email ?? 'User'
  const role = profile?.role ?? 'contractor'
  const avatarColor = AVATAR_COLORS[role] ?? 'bg-brand-600'

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-6">
      <div />

      <div className="flex items-center gap-3">
        {/* Notifications */}
        <button className="relative rounded-lg p-2 text-gray-500 hover:bg-gray-100 hover:text-gray-700">
          <Bell className="h-5 w-5" />
        </button>

        {/* User menu */}
        <div className="relative">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex items-center gap-2 rounded-lg px-2 py-1.5 text-sm text-gray-700 hover:bg-gray-100"
          >
            <span className={`flex h-8 w-8 items-center justify-center rounded-full text-xs font-semibold text-white ${avatarColor}`}>
              {initials(name)}
            </span>
            <div className="hidden sm:block text-left">
              <p className="max-w-[120px] truncate font-medium leading-tight">{name}</p>
              <p className="text-xs text-gray-500 leading-tight">{ROLE_LABELS[role]}</p>
            </div>
            <ChevronDown className="h-4 w-4 text-gray-400" />
          </button>

          {open && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setOpen(false)} />
              <div className="absolute right-0 z-20 mt-1 w-52 rounded-xl border border-gray-200 bg-white py-1 shadow-lg">
                <div className="border-b border-gray-100 px-4 py-2">
                  <p className="text-xs font-medium text-gray-900 truncate">{name}</p>
                  <p className="text-xs text-gray-500">{ROLE_LABELS[role]}</p>
                </div>
                <button
                  onClick={() => { setOpen(false); navigate('/settings') }}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
                >
                  <User className="h-4 w-4" />
                  Profile &amp; Settings
                </button>
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-2 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
                >
                  <LogOut className="h-4 w-4" />
                  Sign out
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
