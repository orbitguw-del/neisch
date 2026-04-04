import { useState } from 'react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import PageHeader from '@/components/ui/PageHeader'

export default function Settings() {
  const { profile, fetchProfile, user } = useAuthStore()
  const [fullName, setFullName] = useState(profile?.full_name ?? '')
  const [saving, setSaving] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState(null)

  const handleSave = async (e) => {
    e.preventDefault()
    setSaving(true)
    setError(null)
    setSuccess(false)
    try {
      const { error: err } = await supabase
        .from('profiles')
        .update({ full_name: fullName })
        .eq('id', user.id)
      if (err) throw err
      await fetchProfile(user.id)
      setSuccess(true)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="max-w-lg">
      <PageHeader title="Settings" description="Manage your profile and account preferences." />

      <div className="card p-6">
        <h2 className="mb-4 text-sm font-semibold text-gray-900">Profile</h2>

        {success && (
          <div className="mb-4 rounded-lg bg-green-50 border border-green-200 px-4 py-3 text-sm text-green-700">
            Profile updated successfully.
          </div>
        )}
        {error && (
          <div className="mb-4 rounded-lg bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-4">
          <div>
            <label className="label">Email</label>
            <input className="input bg-gray-50" value={user?.email ?? ''} disabled />
          </div>
          <div>
            <label className="label">Full name</label>
            <input
              className="input"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              placeholder="Your full name"
            />
          </div>
          <div>
            <label className="label">Role</label>
            <input className="input bg-gray-50 capitalize" value={profile?.role?.replace('_', ' ') ?? ''} disabled />
          </div>
          {profile?.tenant?.name && (
            <div>
              <label className="label">Company</label>
              <input className="input bg-gray-50" value={profile.tenant.name} disabled />
            </div>
          )}
          <div className="flex justify-end pt-1">
            <button type="submit" disabled={saving} className="btn-primary">
              {saving ? 'Saving…' : 'Save changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
