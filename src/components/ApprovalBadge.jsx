import { canonicalApproval } from '@/lib/approval'
import { cn } from '@/lib/utils'

// One badge for the submit → confirm pattern, shared by every module that
// has a "recorded → signed off" record (daily logs, expenses, …).
//
// Props:
//   status  — the raw status string from the record (submitted/confirmed/
//             pending/approved/rejected — canonicalised internally)
//   labels  — optional per-state label overrides, e.g. { approved: 'Confirmed' }

const TONE = {
  pending:  'bg-amber-50 text-amber-700 border-amber-200',
  approved: 'bg-green-50 text-green-700 border-green-200',
  rejected: 'bg-red-50 text-red-700 border-red-200',
}
const DEFAULT_LABEL = { pending: 'Pending', approved: 'Confirmed', rejected: 'Rejected' }

export default function ApprovalBadge({ status, labels = {}, className = '' }) {
  const state = canonicalApproval(status)
  const label = labels[state] ?? DEFAULT_LABEL[state]
  return (
    <span className={cn(
      'inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium',
      TONE[state], className,
    )}>
      {label}
    </span>
  )
}
