import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import useAuthStore from '@/stores/authStore'
import StoreyIcon from '@/components/brand/StoreyIcon'

// Bump these when ToS / Privacy Policy is updated materially.
// They are stored on the profile row for audit purposes.
const TERMS_VERSION   = '2026-05-22'
const PRIVACY_VERSION = '2026-05-22'

export default function Register() {
  const [form, setForm] = useState({
    tenantName: '',
    fullName: '',
    email: '',
    password: '',
  })
  const [consent, setConsent] = useState(false)
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuthStore()
  const navigate = useNavigate()

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    if (!consent) {
      setError('Please accept the Terms of Service and Privacy Policy to continue.')
      return
    }
    setLoading(true)
    try {
      await signUp({
        ...form,
        consent: {
          accepted_at:      new Date().toISOString(),
          terms_version:    TERMS_VERSION,
          privacy_version:  PRIVACY_VERSION,
        },
      })
      navigate('/dashboard')
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-brand-50 to-gray-100 p-4">
      <div className="w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center gap-3">
          <StoreyIcon size={48} />
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900" style={{ fontFamily: 'Georgia, ui-serif, serif' }}>Storey</h1>
            <p className="text-sm text-gray-500">Register your contracting company</p>
          </div>
        </div>

        <div className="card p-6">
          <h2 className="mb-5 text-lg font-semibold text-gray-900">Create your account</h2>

          {error && (
            <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="label">Company / Firm name</label>
              <input
                type="text"
                required
                className="input"
                value={form.tenantName}
                onChange={set('tenantName')}
                placeholder="e.g. Sharma Constructions, Guwahati"
              />
            </div>
            <div>
              <label className="label">Your full name</label>
              <input
                type="text"
                required
                className="input"
                value={form.fullName}
                onChange={set('fullName')}
                placeholder="Rakesh Sharma"
              />
            </div>
            <div>
              <label className="label">Email address</label>
              <input
                type="email"
                autoComplete="email"
                required
                className="input"
                value={form.email}
                onChange={set('email')}
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label className="label">Password</label>
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                className="input"
                value={form.password}
                onChange={set('password')}
                placeholder="Min. 8 characters"
              />
            </div>

            {/* DPDP / ToS consent — required for new sign-ups from 2026-05-22 */}
            <label className="flex items-start gap-2.5 pt-1 text-xs text-gray-700 leading-relaxed cursor-pointer">
              <input
                type="checkbox"
                checked={consent}
                onChange={(e) => setConsent(e.target.checked)}
                className="mt-0.5 h-4 w-4 shrink-0 rounded border-gray-300 text-brand-600 focus:ring-brand-600"
              />
              <span>
                I am at least 18 and I agree to Storey's{' '}
                <Link to="/terms" target="_blank" className="font-medium text-brand-600 hover:text-brand-700 underline">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" target="_blank" className="font-medium text-brand-600 hover:text-brand-700 underline">
                  Privacy Policy
                </Link>
                . I understand Storey is in beta.
              </span>
            </label>

            <button type="submit" disabled={loading || !consent} className="btn-primary w-full mt-1 disabled:opacity-60">
              {loading ? 'Creating account…' : 'Create account'}
            </button>
          </form>
        </div>

        <p className="mt-5 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link to="/login" className="font-medium text-brand-600 hover:text-brand-700">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
