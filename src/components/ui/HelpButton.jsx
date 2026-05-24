import { useState } from 'react'
import { HelpCircle, Loader2 } from 'lucide-react'
import { sendHelpScreenshot, openWhatsAppWindowEarly } from '@/lib/helpScreenshot'
import { useLocation } from 'react-router-dom'

// Map routes → friendly screen names
const SCREEN_NAMES = {
  '/':            'Dashboard',
  '/dashboard':   'Dashboard',
  '/sites':       'Sites',
  '/inventory':   'Inventory',
  '/expenses':    'Expenses',
  '/tasks':       'Tasks',
  '/team':        'Team',
  '/workers':     'Workers',
  '/reports':     'Reports',
  '/equipment':   'Equipment',
  '/receipts':    'Material Receipts',
  '/vendors':     'Vendors',
  '/settings':    'Settings',
  '/profile':     'Profile',
}

function getScreenName(pathname) {
  const path = pathname.replace(/^\/?#/, '') || '/'
  const match = Object.keys(SCREEN_NAMES)
    .filter((k) => path === k || path.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0]
  return SCREEN_NAMES[match] ?? 'App'
}

export default function HelpButton() {
  const location   = useLocation()
  const screenName = getScreenName(location.pathname)
  const [status, setStatus] = useState('idle') // idle | capturing | sent | clipboard | downloaded | error

  async function handleTap() {
    if (status !== 'idle') return

    // ── Open WhatsApp window NOW (sync, inside click handler) ──────────────
    // Must happen before any await or browsers block it as a popup.
    const preOpenedWindow = openWhatsAppWindowEarly()

    setStatus('capturing')

    // Small delay so the "capturing…" badge renders before html2canvas runs
    await new Promise((r) => setTimeout(r, 80))

    const result = await sendHelpScreenshot(screenName, '', preOpenedWindow)

    if (result === 'shared') {
      setStatus('sent')
    } else if (result === 'clipboard') {
      setStatus('clipboard')
    } else if (result === 'downloaded') {
      setStatus('downloaded')
    } else {
      setStatus('error')
    }

    setTimeout(() => setStatus('idle'), 4000)
  }

  // ── Status badges ──────────────────────────────────────────────────────
  if (status === 'capturing') {
    return (
      <div id="help-button-root"
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2
                   rounded-full bg-brand-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
        <Loader2 className="h-4 w-4 animate-spin" />
        Taking screenshot…
      </div>
    )
  }

  if (status === 'sent') {
    return (
      <div id="help-button-root"
        className="fixed bottom-20 right-4 z-50 flex items-center gap-2
                   rounded-full bg-green-600 px-4 py-2.5 text-sm font-medium text-white shadow-lg">
        ✓ Sent to Karun
      </div>
    )
  }

  if (status === 'clipboard') {
    return (
      <div id="help-button-root"
        className="fixed bottom-20 right-4 z-50 max-w-[270px] rounded-2xl
                   bg-white px-4 py-3 text-sm shadow-xl border border-gray-200">
        <p className="font-semibold text-gray-900 mb-1">Screenshot copied ✓</p>
        <p className="text-xs text-gray-500 mb-3">
          WhatsApp is open — click the chat box and press <strong>Ctrl+V</strong> to paste the screenshot, then send.
        </p>
        <button onClick={() => setStatus('idle')}
          className="w-full rounded-lg bg-green-50 py-1.5 text-xs font-medium text-green-700 hover:bg-green-100">
          Got it
        </button>
      </div>
    )
  }

  if (status === 'downloaded') {
    return (
      <div id="help-button-root"
        className="fixed bottom-20 right-4 z-50 max-w-[260px] rounded-2xl
                   bg-white px-4 py-3 text-sm shadow-xl border border-gray-200">
        <p className="font-semibold text-gray-900 mb-1">Screenshot saved ✓</p>
        <p className="text-xs text-gray-500 mb-3">
          WhatsApp opened — attach the screenshot from your Downloads and send.
        </p>
        <button onClick={() => setStatus('idle')}
          className="w-full rounded-lg bg-gray-100 py-1.5 text-xs font-medium text-gray-700 hover:bg-gray-200">
          Got it
        </button>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div id="help-button-root"
        className="fixed bottom-20 right-4 z-50 max-w-[240px] rounded-2xl
                   bg-white px-4 py-3 text-sm shadow-xl border border-gray-200">
        <p className="font-semibold text-gray-900 mb-1">Screenshot failed</p>
        <p className="text-xs text-gray-500 mb-3">WhatsApp opened without the image.</p>
        <button onClick={() => setStatus('idle')}
          className="w-full rounded-lg bg-gray-100 py-1.5 text-xs text-gray-500 hover:bg-gray-200">
          Close
        </button>
      </div>
    )
  }

  // ── Idle: single floating ? button ─────────────────────────────────────
  return (
    <button
      id="help-button-root"
      onClick={handleTap}
      className="fixed bottom-20 right-4 z-50 flex h-12 w-12 items-center justify-center
                 rounded-full bg-brand-600 text-white shadow-lg hover:bg-brand-700
                 transition-all active:scale-95"
      aria-label="Send help screenshot to Karun"
    >
      <HelpCircle className="h-5 w-5" />
    </button>
  )
}
