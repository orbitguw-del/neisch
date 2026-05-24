import { useState, useRef } from 'react'
import { HelpCircle, X, MessageCircle, Mail, Camera, Loader2 } from 'lucide-react'
import { sendHelpScreenshot, sendHelpEmail } from '@/lib/helpScreenshot'
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
  // Strip hash prefix if present: /#/inventory → /inventory
  const path = pathname.replace(/^\/?#/, '') || '/'
  // Match longest prefix
  const match = Object.keys(SCREEN_NAMES)
    .filter((k) => path === k || path.startsWith(k + '/'))
    .sort((a, b) => b.length - a.length)[0]
  return SCREEN_NAMES[match] ?? 'App'
}

export default function HelpButton() {
  const location = useLocation()
  const screenName = getScreenName(location.pathname)

  const [open,    setOpen]    = useState(false)
  const [status,  setStatus]  = useState('idle') // idle | capturing | sent | downloaded | error
  const [note,    setNote]    = useState('')
  const inputRef = useRef(null)

  async function handleWhatsApp() {
    setStatus('capturing')
    setOpen(false) // close panel so it's not in the screenshot

    // Small delay so panel finishes closing before capture
    await new Promise((r) => setTimeout(r, 120))

    const result = await sendHelpScreenshot(screenName, note)
    setNote('')

    if (result === 'shared') {
      setStatus('sent')
    } else if (result === 'downloaded') {
      setStatus('downloaded')
    } else {
      setStatus('error')
    }

    setTimeout(() => setStatus('idle'), 4000)
  }

  function handleEmail() {
    sendHelpEmail(screenName, note)
    setNote('')
    setOpen(false)
    setStatus('sent')
    setTimeout(() => setStatus('idle'), 3000)
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
        ✓ Help request sent
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
          Check your Downloads folder. WhatsApp opened — attach the screenshot and send.
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
        <div className="flex gap-2">
          <button onClick={handleEmail}
            className="flex-1 rounded-lg bg-brand-50 py-1.5 text-xs font-medium text-brand-700 hover:bg-brand-100">
            Email instead
          </button>
          <button onClick={() => setStatus('idle')}
            className="rounded-lg bg-gray-100 px-3 py-1.5 text-xs text-gray-500 hover:bg-gray-200">
            Close
          </button>
        </div>
      </div>
    )
  }

  // ── Main panel ─────────────────────────────────────────────────────────
  return (
    <div id="help-button-root" className="fixed bottom-20 right-4 z-50">

      {/* Expanded panel */}
      {open && (
        <div className="absolute bottom-14 right-0 w-72 rounded-2xl bg-white shadow-2xl
                        border border-gray-100 overflow-hidden">
          {/* Header */}
          <div className="flex items-center justify-between bg-brand-600 px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-white">Need help?</p>
              <p className="text-xs text-brand-100 mt-0.5">{screenName} screen</p>
            </div>
            <button onClick={() => setOpen(false)}
              className="flex h-7 w-7 items-center justify-center rounded-full
                         text-brand-100 hover:bg-brand-500 hover:text-white">
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Note input */}
          <div className="px-4 pt-3 pb-2">
            <p className="text-xs text-gray-500 mb-1.5">
              Describe the issue (optional)
            </p>
            <textarea
              ref={inputRef}
              rows={2}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="e.g. Can't add a new material…"
              className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm
                         text-gray-800 placeholder-gray-400 resize-none
                         focus:border-brand-400 focus:outline-none focus:ring-1 focus:ring-brand-400"
            />
          </div>

          {/* How it works */}
          <p className="px-4 pb-2 text-xs text-gray-400 flex items-center gap-1">
            <Camera className="h-3.5 w-3.5 flex-shrink-0" />
            Screenshot of this screen will be attached automatically
          </p>

          {/* Action buttons */}
          <div className="border-t border-gray-100 p-3 space-y-2">
            {/* WhatsApp — primary */}
            <button
              onClick={handleWhatsApp}
              className="flex w-full items-center gap-3 rounded-xl bg-[#25D366] px-4 py-3
                         text-sm font-semibold text-white hover:bg-[#1ebe5d] transition-colors"
            >
              {/* WhatsApp icon */}
              <svg className="h-5 w-5 flex-shrink-0" viewBox="0 0 24 24" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              <span className="flex-1 text-left">
                Send via WhatsApp
                <span className="block text-xs font-normal text-green-100">
                  with screenshot attached
                </span>
              </span>
            </button>

            {/* Email — secondary */}
            <button
              onClick={handleEmail}
              className="flex w-full items-center gap-3 rounded-xl border border-gray-200
                         bg-gray-50 px-4 py-2.5 text-sm font-medium text-gray-700
                         hover:bg-gray-100 transition-colors"
            >
              <Mail className="h-4 w-4 text-gray-400 flex-shrink-0" />
              <span className="flex-1 text-left">
                Send by email
                <span className="block text-xs font-normal text-gray-400">
                  {/* help@storeyinfra.com */}
                  help@storeyinfra.com
                </span>
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Floating ? button */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="flex h-12 w-12 items-center justify-center rounded-full
                   bg-brand-600 text-white shadow-lg hover:bg-brand-700
                   transition-all active:scale-95"
        aria-label="Help"
      >
        {open
          ? <X className="h-5 w-5" />
          : <HelpCircle className="h-5 w-5" />
        }
      </button>
    </div>
  )
}
