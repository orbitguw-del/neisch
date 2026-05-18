// Shared "submit → confirm" approval model.
//
// Several modules carry the same idea — a record is recorded by a junior role
// and signed off by a senior one — but each used its own column words
// (approval_status: submitted/confirmed, status: pending/approved, …).
// This maps any of those raw words to ONE canonical state so the UI is
// consistent. The DB columns are left as-is; only the display is unified.

// Canonical states.
export const APPROVAL_STATES = ['pending', 'approved', 'rejected']

// Map a module's raw status word to a canonical approval state.
const RAW_TO_CANONICAL = {
  submitted: 'pending',
  pending:   'pending',
  confirmed: 'approved',
  approved:  'approved',
  rejected:  'rejected',
}

/** Canonical approval state ('pending' | 'approved' | 'rejected') for any raw value. */
export function canonicalApproval(raw) {
  return RAW_TO_CANONICAL[raw] ?? 'pending'
}

/** True when a record has been signed off. */
export function isApproved(raw) {
  return canonicalApproval(raw) === 'approved'
}
