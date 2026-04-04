import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Building2 } from 'lucide-react'
import useAuthStore from '@/stores/authStore'

export default function Register() {
  const [form, setForm] = useState({
    tenantName: '',
    fullName: '',
    email: '',
    password: '',
  })
  const [error, setError] = useState(null)
  const [loading, setLoading] = useState(false)
  const { signUp } = useAuthStore()
  const navigate = useNavigate()

  const set = (key) => (e) => setForm((f) => ({ ...f, [key]: e.target.value }))

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      await signUp(form)
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
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-brand-600 shadow-lg">
            <Building2 className="h-7 w-7 text-white" />
          </div>
          <div className="text-center">
            <h1 className="text-2xl font-bold text-gray-900">ConsNE</h1>
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
            <button type="submit" disabled={loading} className="btn-primary w-full mt-1">
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
