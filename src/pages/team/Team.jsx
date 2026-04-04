import InviteSection from '@/components/team/InviteSection'
import { useEffect, useState } from 'react'
import { UserPlus, Trash2, UserCog } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import useAuthStore from '@/stores/authStore'
import useSiteStore from '@/stores/siteStore'
import useAssignmentStore from '@/stores/assignmentStore'
import PageHeader from '@/components/ui/PageHeader'
import EmptyState from '@/components/ui/EmptyState'
import Modal from '@/components/ui/Modal'

const ASSIGNABLE_ROLES = ['site_manager', 'supervisor', 'store_keeper']
const ROLE_LABELS = {
  site_manager: 'Site Manager',
  supervisor:   'Supervisor',
  store_keeper: 'Store Keeper',
  contractor:   'Contractor',
}

function AssignForm({ sites, tenantMembers, onSubmit, loading }) {
  const [form, setForm] = useState({
    profile_id: '',
    site_id: sites[0]?.id ?? '',
    role: 'site_manager',
  })
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }))

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        const site = sites.find((s) => s.id === form.site_id)
        onSubmit({ ...form, tenant_id: site?.tenant_id })
      }}
      className="space-y-4"
    >
      <div>
        <label className="label">Team member *</label>
        <select className="input" required value={form.profile_id} onChange={set('profile_id')}>
          <option value="">— Select person —</option>
          {tenantMembers.map((m) => (
            <option key={m.id} value={m.id}>
              {m.full_name ?? 'Unnamed'} ({ROLE_LABELS[m.role] ?? m.role})
            </option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Site *</label>
        <select className="input" required value={form.site_id} onChange={set('site_id')}>
          {sites.map((s) => (
            <option key={s.id} value={s.id}>{s.name}</option>
          ))}
        </select>
      </div>
      <div>
        <label className="label">Assign as *</label>
        <select className="input" value={form.role} onChange={set('role')}>
          {ASSIGNABLE_ROLES.map((r) => (
            <option key={r} value={r}>{ROLE_LABELS[r]}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end pt-1">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? 'Assigning…' : 'Assign to site'}
        </button>
      </div>
    </form>
  )
}

export default function Team() {
  const profile = useAuthStore((s) => s.profile)
  const { sites, fetchSites } = useSiteStore()
  const { assignments, fetchTenantAssignments, createAssignment, deleteAssignment } = useAssignmentStore()

  const [tenantMembers, setTenantMembers] = useState([])
  const [modalOpen, setModalOpen]         = useState(false)
  const [saving,    setSaving]            = useState(false)
  const [error,     setError]             = useState(null)

  const tenantId = profile?.tenant_id

  useEffect(() => {
    if (!tenantId) return
    fetchSites(tenantId)
    fetchTenantAssignments(tenantId)

    supabase
      .from('profiles')
      .select('id, full_name, role')
      .eq('tenant_id', tenantId)
      .neq('role', 'contractor')
      .then(({ data, error }) => {
        if (error) setError(error.message)
        else setTenantMembers(data ?? [])
      })
  }, [tenantId, fetchSites, fetchTenantAssignments])

  const handleAssign = async (payload) => {
    setSaving(true)
    setError(null)
    try {
      await createAssignment({ ...payload, assigned_by: profile?.id })
      await fetchTenantAssignments(tenantId)
      setModalOpen(false)
    } catch (err) {
      setError(err.message)
    } finally {
      setSaving(false)
    }
  }

  const handleRemove = async (assignmentId) => {
    try {
      await deleteAssignment(assignmentId)
      await fetchTenantAssignments(tenantId)
    } catch (err) {
      setError(err.message)
    }
  }

  const bySite = assignments.reduce((acc, a) => {
    const key = a.site_id
    if (!acc[key]) acc[key] = { site: a.site, members: [] }
    acc[key].members.push(a)
    return acc
  }, {})

  return (
    <div>
      <PageHeader
        title="Team"
        description="Manage site assignments for your managers, supervisors, and store keepers."
        action={
          <button onClick={() => setModalOpen(true)} className="btn-primary">
            <UserPlus className="h-4 w-4" /> Assign to site
          </button>
        }
      />

      {error && (
        <div className="mb-4 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {tenantMembers.length === 0 && (
        <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700">
          No team members found. Team members must register with their company email and you can assign them here once their accounts exist.
        </div>
      )}

      {Object.keys(bySite).length === 0 ? (
        <EmptyState
          icon={UserCog}
          title="No assignments yet"
          description="Assign site managers, supervisors, and store keepers to your construction sites."
          action={
            <button onClick={() => setModalOpen(true)} className="btn-primary">
              <UserPlus className="h-4 w-4" /> Make first assignment
            </button>
          }
        />
      ) : (
        <div className="space-y-4">
          {Object.values(bySite).map(({ site, members }) => (
            <div key={site?.id} className="card overflow-hidden">
              <div className="border-b border-gray-200 bg-gray-50 px-5 py-3">
                <p className="text-sm font-semibold text-gray-900">{site?.name ?? 'Unknown Site'}</p>
                {site?.location && <p className="text-xs text-gray-500">{site.location}</p>}
              </div>
              <div className="divide-y divide-gray-100">
                {members.map((a) => (
                  <div key={a.id} className="flex items-center justify-between px-5 py-3">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {a.profile?.full_name ?? 'Unknown'}
                      </p>
                      <p className="text-xs text-gray-500">
                        {ROLE_LABELS[a.role] ?? a.role}
                      </p>
                    </div>
                    <button
                      onClick={() => handleRemove(a.id)}
                      className="rounded-lg p-1.5 text-gray-400 hover:bg-red-50 hover:text-red-500 transition-colors"
                      title="Remove assignment"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="mt-8">
        <InviteSection sites={sites} />
      </div>

      <Modal open={modalOpen} onClose={() => { setModalOpen(false); setError(null) }} title="Assign to Site">
        {sites.length === 0 ? (
          <p className="text-sm text-gray-500">No sites found. Create a site first.</p>
        ) : (
          <AssignForm
            sites={sites}
            tenantMembers={tenantMembers}
            onSubmit={handleAssign}
            loading={saving}
          />
        )}
      </Modal>
    </div>
  )
}
