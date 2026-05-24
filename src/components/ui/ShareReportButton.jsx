import { useState, useRef, useEffect } from 'react'
import { Share2, MessageCircle, Mail, CheckCircle, X } from 'lucide-react'

/**
 * ShareReportButton
 *
 * Usage:
 *   <ShareReportButton
 *     text="Material Consumption — May 2026\nSite: All sites\nMaterials used: 14\nTotal value: ₹12.1L"
 *     emailSubject="Storey Report — Consumption May 2026"
 *     emailBody="Hi,\n\nPlease find the consumption summary below:\n\n..."
 *   />
 *
 * Flow:
 *   1. User taps Share
 *   2. WhatsApp opens (wa.me link — works on phone + PC with WA installed)
 *   3. Small prompt: "Did WhatsApp open?" → [Yes ✓]  [No — email instead]
 *   4. If No → opens mailto: link
 */
export default function ShareReportButton({ text = '', emailSubject = 'Storey Report', emailBody = '' }) {
  const [state, setState] = useState('idle') // idle | asked | sent
  const timerRef = useRef(null)

  useEffect(() => () => clearTimeout(timerRef.current), [])

  function handleShare() {
    // Open WhatsApp — wa.me works on:
    //   Mobile  → opens WhatsApp app directly
    //   PC/Mac with WhatsApp Desktop installed → opens desktop app
    //   PC/Mac without WhatsApp → opens WhatsApp Web in browser
    const waUrl = `https://wa.me/?text=${encodeURIComponent(text)}`
    window.open(waUrl, '_blank', 'noopener,noreferrer')

    // After 1.5s ask if it worked
    setState('asked')
  }

  function handleYes() {
    setState('sent')
    timerRef.current = setTimeout(() => setState('idle'), 2500)
  }

  function handleEmail() {
    const body   = emailBody || text
    const mailto = `mailto:?subject=${encodeURIComponent(emailSubject)}&body=${encodeURIComponent(body)}`
    window.location.href = mailto
    setState('idle')
  }

  function handleDismiss() {
    setState('idle')
  }

  // ── Sent confirmation ────────────────────────────────────────────────────
  if (state === 'sent') {
    return (
      <div className="flex items-center gap-1.5 rounded-lg bg-green-50 px-3 py-2 text-sm font-medium text-green-700">
        <CheckCircle className="h-4 w-4" /> Shared ✓
      </div>
    )
  }

  // ── Did WhatsApp open? prompt ────────────────────────────────────────────
  if (state === 'asked') {
    return (
      <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2 shadow-sm">
        <span className="text-xs text-gray-600 whitespace-nowrap">WhatsApp open?</span>
        <button
          onClick={handleYes}
          className="rounded-md bg-green-50 px-2 py-1 text-xs font-semibold text-green-700 hover:bg-green-100"
        >
          Yes ✓
        </button>
        <button
          onClick={handleEmail}
          className="flex items-center gap-1 rounded-md bg-gray-100 px-2 py-1 text-xs font-medium text-gray-700 hover:bg-gray-200"
        >
          <Mail className="h-3.5 w-3.5" /> Email
        </button>
        <button onClick={handleDismiss} className="text-gray-300 hover:text-gray-500">
          <X className="h-3.5 w-3.5" />
        </button>
      </div>
    )
  }

  // ── Default share button ─────────────────────────────────────────────────
  return (
    <button
      onClick={handleShare}
      className="btn-secondary flex items-center gap-1.5 text-sm"
      title="Share via WhatsApp or Email"
    >
      <Share2 className="h-4 w-4" />
      Share
    </button>
  )
}
