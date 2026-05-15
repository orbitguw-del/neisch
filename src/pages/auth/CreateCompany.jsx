import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import StoreyIcon from '@/components/brand/StoreyIcon'
import useAuthStore from '@/stores/authStore'

export default function CreateCompany() {
  const [tenantName, setTenantName] = useState('')
  const [loading, setLoading]       = useState(false)
  const [error, setError]           = useState('')
  const { createTenantForUser, signOut, profile } = useAuthStore()
  const navigate = useNavigate()

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!tenantName.trim()) return
    setLoading(true)
    setError('')
    try {
      await createTenantForUser(tenantName.trim())
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 p-4">
      <div className="w-full max-w-sm">

        <div className="mb-8 flex flex-col items-center gap-3 text-center">
          <StoreyIcon size={48} />
          <div>
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, ui-serif, serif' }}>
              Welcome to Storey
            </h1>
            <p className="text-sm text-gray-500 mt-1">
              {profile?.full_name ? `Hi ${profile.full_name}!` : 'Almost there!'} Set up your company to get started.
            </p>
          </div>
        </div>

        <div className="card p-6">
          <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-amber-50">
            <Building2 className="h-5 w-5 text-amber-600" />
          </div>
          <h2 className="text-lg font-semibold text-gray-900 mb-1">Name your company</h2>
          <p className="text-sm text-gray-500 mb-5">
            This is the name your team members will see when they're invited to join Storey.
          </p>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label" htmlFor="company-name">Company / Firm name</label>
              <input
                id="company-name"
                type="text"
                required
                className="input"
                value={tenantName}
                onChange={(e) => setTenantName(e.target.value)}
                placeholder="e.g. Sharma Constructions"
                autoFocus
              />
            </div>
            <button
              type="submit"
              disabled={loading || !tenantName.trim()}
              className="btn-primary w-full"
            >
              {loading ? 'Creating…' : 'Create company & continue'}
            </button>
          </form>
        </div>

        <button
          type="button"
          onClick={() => signOut().then(() => navigate('/login', { replace: true }))}
          className="mt-4 w-full text-center text-xs text-gray-400 hover:text-gray-600 transition-colors"
        >
          Sign out and use a different account
        </button>
      </div>
    </div>
  )
}
