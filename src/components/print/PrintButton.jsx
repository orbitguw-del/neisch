import { Printer } from 'lucide-react'

/**
 * Triggers the browser's print dialog. Uses Tailwind's `no-print` so the
 * button itself doesn't appear on paper. Works on every modern browser
 * including mobile (iOS/Android both honour window.print()).
 *
 * Tip: in the print dialog the user can also pick "Save as PDF" as the
 * destination — same code path produces a printable PDF.
 */
export default function PrintButton({
  label = 'Print',
  className = '',
  ariaLabel,
}) {
  return (
    <button
      type="button"
      onClick={() => window.print()}
      aria-label={ariaLabel ?? label}
      className={`btn-secondary no-print text-sm ${className}`}
    >
      <Printer className="h-4 w-4" />
      {label}
    </button>
  )
}
