import { clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/** Merges Tailwind classes safely, deduplicating conflicts. */
export function cn(...inputs) {
  return twMerge(clsx(inputs))
}

/** Format a number as Indian currency (INR). */
export function formatINR(amount) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount)
}

/** Format a date to DD MMM YYYY.
 *  Fix: date-only strings (YYYY-MM-DD) are parsed as UTC midnight by default,
 *  which causes a day-behind display in IST (+5:30). Appending T00:00 forces
 *  local timezone parsing. */
export function formatDate(dateStr) {
  if (!dateStr) return '—'
  const d = dateStr.length === 10 ? new Date(dateStr + 'T00:00') : new Date(dateStr)
  return new Intl.DateTimeFormat('en-IN', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  }).format(d)
}

/** Truncate a string to maxLen characters. */
export function truncate(str, maxLen = 40) {
  if (!str) return ''
  return str.length > maxLen ? str.slice(0, maxLen) + '…' : str
}

/** Derive user initials from a full name. */
export function initials(name = '') {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}
