import { useState } from 'react'
import { ChevronDown, ChevronUp, LifeBuoy, BookOpen } from 'lucide-react'
import useAuthStore from '@/stores/authStore'
import PageHeader from '@/components/ui/PageHeader'

// ── How-to content, per role ──────────────────────────────────────────────────

const HOWTO = {
  contractor: {
    label: 'Contractor',
    blurb: 'You have full access — sites, team, money and reports.',
    tasks: [
      { t: 'Add a construction site', s: [
        'Menu → Sites → tap Add Site.',
        'Enter name, location, start date and budget.',
        'Set status (Planning / Active) and Save.' ] },
      { t: 'Add a worker', s: [
        'Menu → Workers → Add Worker.',
        'Enter name, trade, daily wage and phone.',
        'Choose Direct hire or Vendor; assign to a site.',
        'ID proof — enter only the last 4 digits — then Add Worker.' ],
        tip: 'Never enter the full Aadhaar/PAN — last 4 digits only.' },
      { t: 'Invite a team member', s: [
        'Menu → Team → Invite.',
        'Enter their email, pick the role, assign site(s).',
        'Send — they join with the invite code.' ] },
      { t: 'Mark daily attendance', s: [
        'Menu → Attendance. Pick site and date.',
        'Tap each worker to cycle Present → Absent → Half-day → Paid-leave.',
        'Use Mark all present to speed up, then Save.' ] },
      { t: 'Record a material receipt', s: [
        'Menu → Receipts → Record receipt.',
        'Pick site and material; enter quantity, supplier, unit cost.',
        'Save — inventory updates automatically.' ] },
      { t: 'Add & approve site expenses', s: [
        'Menu → Expenses → Add Expense for a new spend.',
        'To approve: filter Status = Pending, review, tap Approve or Reject.' ],
        tip: 'Only approved expenses count in reports.' },
      { t: 'Generate & print a report', s: [
        'Menu → Reports. Pick a tab and set date / site filters.',
        'Tap Print → choose a printer, or Save as PDF to share.' ] },
    ],
  },
  site_manager: {
    label: 'Site Manager',
    blurb: 'You run your assigned sites — workers, materials, expense approvals.',
    tasks: [
      { t: 'Add a worker', s: [
        'Menu → Workers → Add Worker.',
        'Fill name, trade, daily wage; assign to your site.',
        'ID proof — last 4 digits only — then Add Worker.' ] },
      { t: 'Mark attendance', s: [
        'Menu → Attendance. Pick site and date.',
        'Tap each worker to set status, then Save.' ] },
      { t: 'Write a daily log', s: [
        'Menu → Daily Logs → New log.',
        'Enter date, workers present, weather, work done, issues — Save.' ] },
      { t: 'Record receipts & transfers', s: [
        'Receipts → record incoming materials with cost.',
        'Transfers → move stock to/from another site.',
        'Equipment → register machines and maintenance.' ] },
      { t: 'Approve a Supervisor’s expense', s: [
        'Menu → Expenses → filter Status = Pending.',
        'Check the entry, tap Approve or Reject.' ],
        tip: 'Clear pending expenses daily so reports stay accurate.' },
    ],
  },
  supervisor: {
    label: 'Site Supervisor',
    blurb: 'Your on-ground daily tasks — attendance, logs, expenses.',
    tasks: [
      { t: 'Mark attendance (every morning)', s: [
        'Menu → Attendance — today is pre-selected.',
        'Tap each worker to cycle P / A / ½ / PL.',
        'Tap Mark all present first, fix exceptions, then Save.' ] },
      { t: 'Write the daily log (every evening)', s: [
        'Menu → Daily Logs → New log.',
        'Enter workers present, work done, weather and any issues — Save.' ] },
      { t: 'Raise a site expense (when cash is spent)', s: [
        'Menu → Expenses → Add Expense.',
        'Pick site, date, category, amount, who paid and a note.',
        'Add Expense — it goes to your Site Manager as Pending.' ],
        tip: 'Log the expense the moment money is spent — small spends get forgotten.' },
      { t: 'Add a worker', s: [
        'Menu → Workers → Add Worker.',
        'Enter name, trade, daily wage; assign to the site.' ] },
    ],
  },
  store_keeper: {
    label: 'Store Keeper',
    blurb: 'You keep materials and equipment accurate.',
    tasks: [
      { t: 'Add a material to inventory', s: [
        'Menu → Inventory → Add Material.',
        'Enter name, unit, opening stock, reorder level and unit cost — Save.' ] },
      { t: 'Record a material receipt (GRN)', s: [
        'Menu → Receipts → Record receipt.',
        'Pick site and material; enter quantity, supplier, unit cost.',
        'Save — stock rises automatically.' ],
        tip: 'Record receipts the day goods arrive so stock matches reality.' },
      { t: 'Transfer materials to another site', s: [
        'Menu → Transfers → New transfer.',
        'Choose From-site, To-site, material and quantity — Save.' ] },
      { t: 'Add equipment / an asset', s: [
        'Menu → Equipment → Add Equipment.',
        'Enter name, type and the site it is at — Save.' ] },
      { t: 'Check stock levels', s: [
        'Menu → Inventory — see live quantity for every material.',
        'Items at/below reorder level need restocking.',
        'Tap a material for its full receipt/transfer history.' ] },
    ],
  },
}

const ROLE_ORDER = ['contractor', 'site_manager', 'supervisor', 'store_keeper']

// ── Components ────────────────────────────────────────────────────────────────

function Task({ task }) {
  return (
    <div className="rounded-lg border border-gray-200 overflow-hidden">
      <div className="bg-brand-50 px-4 py-2.5 font-display text-sm font-semibold text-gray-900">
        {task.t}
      </div>
      <div className="px-4 py-3">
        <ol className="space-y-1.5">
          {task.s.map((step, i) => (
            <li key={i} className="flex gap-2.5 text-sm text-gray-700">
              <span className="flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full bg-sage-400 text-[11px] font-bold text-white"
                style={{ backgroundColor: '#A7BEAE' }}>
                {i + 1}
              </span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
        {task.tip && (
          <p className="mt-2 rounded border-l-2 border-brand-400 bg-gray-50 px-3 py-1.5 text-xs text-gray-500">
            <span className="font-semibold text-brand-600">Tip: </span>{task.tip}
          </p>
        )}
      </div>
    </div>
  )
}

function RoleSection({ roleKey, defaultOpen }) {
  const [open, setOpen] = useState(defaultOpen)
  const role = HOWTO[roleKey]
  if (!role) return null
  return (
    <div className="card overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
      >
        <div>
          <h2 className="font-display text-base font-semibold text-gray-900">{role.label}</h2>
          <p className="text-xs text-gray-500">{role.blurb}</p>
        </div>
        {open ? <ChevronUp className="h-5 w-5 text-gray-400" />
              : <ChevronDown className="h-5 w-5 text-gray-400" />}
      </button>
      {open && (
        <div className="space-y-3 border-t border-gray-100 px-5 py-4">
          {role.tasks.map((task, i) => <Task key={i} task={task} />)}
        </div>
      )}
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function Help() {
  const profile = useAuthStore((s) => s.profile)
  const myRole = profile?.role
  const mine = HOWTO[myRole] ? myRole : null
  const others = ROLE_ORDER.filter((r) => r !== mine)

  return (
    <div className="max-w-2xl space-y-5">
      <PageHeader
        title="Help & How-To"
        description="Step-by-step instructions for every task. Works the same on the app and website."
      />

      {mine ? (
        <>
          <div className="rounded-lg bg-brand-50 border border-brand-200 px-4 py-3 text-sm text-brand-800 flex items-center gap-2">
            <BookOpen className="h-4 w-4 flex-shrink-0" />
            <span>Showing your role first — <strong>{HOWTO[mine].label}</strong>. Other roles are below.</span>
          </div>
          <RoleSection roleKey={mine} defaultOpen />
          <h3 className="font-display text-sm font-semibold text-gray-500 pt-2">Other roles</h3>
          {others.map((r) => <RoleSection key={r} roleKey={r} defaultOpen={false} />)}
        </>
      ) : (
        // superadmin or unknown role — show everything
        ROLE_ORDER.map((r, i) => <RoleSection key={r} roleKey={r} defaultOpen={i === 0} />)
      )}

      <div className="card p-5 flex items-start gap-3">
        <LifeBuoy className="h-5 w-5 flex-shrink-0 text-brand-600" />
        <div className="text-sm text-gray-700">
          <p className="font-semibold text-gray-900">Still stuck?</p>
          <p className="text-gray-600">
            Email us at{' '}
            <a href="mailto:help@storeyinfra.com" className="font-medium text-brand-600 hover:underline">
              help@storeyinfra.com
            </a>
            {' '}— we reply within one business day.
          </p>
        </div>
      </div>
    </div>
  )
}
