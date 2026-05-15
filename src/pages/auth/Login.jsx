import { useState } from 'react'
import { Link } from 'react-router-dom'
import StoreyIcon from '@/components/brand/StoreyIcon'
import HelpDesk from '@/components/auth/HelpDesk'
import EmailPasswordLogin from './tabs/EmailPasswordLogin'
import AcceptInviteTab from './tabs/AcceptInviteTab'
import AdminSignupTab from './tabs/AdminSignupTab'
import GoogleLoginButton from './tabs/GoogleLoginButton'
import SMSOTPLogin from './tabs/SMSOTPLogin'

const TABS = [
  { key: 'signin',  label: 'Sign In' },
  { key: 'invite',  label: 'Accept Invite' },
  { key: 'admin',   label: 'Admin' },
]

export default function Login() {
  const [tab, setTab] = useState('signin')

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 p-4">
      <div className="w-full max-w-sm">

        {/* Brand */}
        <div className="mb-8 flex flex-col items-center gap-3">
          <StoreyIcon size={48} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, ui-serif, serif' }}>Storey</h1>
            <p className="text-sm text-gray-500">Construction, organised.</p>
            <p className="mt-1 text-xs text-gray-400">ConTech ERP · real-time site decisions</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="mb-6 flex rounded-lg bg-gray-100 p-1">
          {TABS.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              className={`flex-1 rounded-md py-2 text-sm font-medium transition-all ${
                tab === key
                  ? 'bg-white text-gray-900 shadow'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        {/* Sign In */}
        {tab === 'signin' && (
          <div className="space-y-4">
            <GoogleLoginButton />

            <Divider />

            <EmailPasswordLogin />

            <Divider />

            <SMSOTPLogin />

            <p className="mt-5 text-center text-sm text-gray-600">
              Don't have an account?{' '}
              <Link to="/register" className="font-medium text-brand-600 hover:text-brand-700">
                Register your company
              </Link>
            </p>
          </div>
        )}

        {/* Accept Invite */}
        {tab === 'invite' && (
          <div className="space-y-4">
            <GoogleLoginButton label="Accept Invite with Google" />
            <Divider />
            <AcceptInviteTab />
            <p className="mt-4 text-center text-sm text-gray-600">
              Already have an account?{' '}
              <button
                type="button"
                onClick={() => setTab('signin')}
                className="font-medium text-brand-600 hover:text-brand-700"
              >
                Sign in instead
              </button>
            </p>
          </div>
        )}

        {/* Admin */}
        {tab === 'admin' && <AdminSignupTab />}

        {/* Help desk — universal, visible across all tabs */}
        <HelpDesk />

      </div>
    </div>
  )
}

function Divider() {
  return (
    <div className="flex items-center gap-3">
      <div className="flex-1 border-t border-gray-200" />
      <span className="text-xs text-gray-400 uppercase tracking-wide">or</span>
      <div className="flex-1 border-t border-gray-200" />
    </div>
  )
}
