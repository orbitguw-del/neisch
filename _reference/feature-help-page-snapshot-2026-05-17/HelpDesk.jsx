import { useState } from 'react'
import { LifeBuoy, Mail, X, CheckCircle } from 'lucide-react'
import { supabase } from '@/lib/supabase'

const SUPPORT_EMAIL = 'help@storeyinfra.com'

export default function HelpDesk({ collapsedLabel = 'Need help signing in?' }) {
  const [open, setOpen]       = useState(false)
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')
  const [message, setMessage] = useState('')
  const [sending, setSending] = useState(false)
  const [sent, setSent]       = useState(false)
  const [error, setError]     = useState('')

  const buildMailto = () => {
    const subject = encodeURIComponent('Storey support request')
    const lines = [
      name  && `Name: ${name}`,
      email && `Email: ${email}`,
      '',
      message,
    ].filter((l) => l !== undefined).join('\n')
    return `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${encodeURIComponent(lines)}`
  }

  const handleSend = async (e) => {
    e.preventDefault()
    setError('')
    setSending(true)

    try {
      const { data, error: fnError } = await supabase.functions.invoke('send-support-email', {
        body: {
          name,
          from_email: email,
          message,
          page: typeof window !== 'undefined' ? window.location.pathname : null,
        },
      })

      // If the server actually sent the email, show a success state.
      if (!fnError && data?.success) {
        setSent(true)
        return
      }

      // Server is reachable but couldn't send (e.g. RESEND_API_KEY unset, upstream
      // failure). The function explicitly returns `fallback: 'mailto'` in those
      // cases — open the user's email client as a graceful degradation.
      if (data?.fallback === 'mailto') {
        window.location.href = buildMailto()
        return
      }

      // Unknown error: surface it but still offer the mailto path.
      setError(fnError?.message || data?.error || 'Could not send right now.')
    } catch {
      // Network failure — fall back to mailto.
      window.location.href = buildMailto()
    } finally {
      setSending(false)
    }
  }

  const reset = () => {
    setSent(false)
    setError('')
    setName('')
    setEmail('')
    setMessage('')
  }

  if (!open) {
    return (
      <div className="mt-6 flex justify-center">
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-gray-700 transition-colors"
        >
          <LifeBuoy className="h-3.5 w-3.5" />
          {collapsedLabel}
        </button>
      </div>
    )
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-lg border border-green-200 bg-green-50 p-4 shadow-sm">
        <div className="mb-1 flex items-start justify-between">
          <h3 className="flex items-center gap-1.5 text-sm font-semibold text-green-800">
            <CheckCircle className="h-4 w-4" />
            Message sent
          </h3>
          <button
            type="button"
            onClick={() => { setOpen(false); reset() }}
            aria-label="Close"
            className="text-green-700/60 hover:text-green-800"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
        <p className="text-xs text-green-700">
          We'll reply within one business day at{email ? <> <strong>{email}</strong></> : <> the email you provided</>}.
        </p>
      </div>
    )
  }

  return (
    <div className="mt-6 rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
      <div className="mb-2 flex items-start justify-between">
        <h3 className="flex items-center gap-1.5 text-sm font-semibold text-gray-900">
          <LifeBuoy className="h-4 w-4 text-brand-600" />
          Contact support
        </h3>
        <button
          type="button"
          onClick={() => { setOpen(false); reset() }}
          aria-label="Close support form"
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mb-3 text-xs text-gray-500">
        Email us at{' '}
        <a href={`mailto:${SUPPORT_EMAIL}`} className="font-medium text-brand-600 hover:underline">
          {SUPPORT_EMAIL}
        </a>
        {' '}or fill in below — we'll reply within one business day.
      </p>

      <form onSubmit={handleSend} className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <input
            type="text"
            className="input text-sm"
            placeholder="Your name (optional)"
            value={name}
            onChange={(e) => setName(e.target.value)}
            disabled={sending}
          />
          <input
            type="email"
            className="input text-sm"
            placeholder="Your email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={sending}
          />
        </div>
        <textarea
          rows={3}
          className="input text-sm"
          placeholder="Briefly describe your issue…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          minLength={3}
          maxLength={5000}
          required
          disabled={sending}
        />
        {error && (
          <p className="text-xs text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={sending}
          className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-1.5"
        >
          <Mail className="h-4 w-4" />
          {sending ? 'Sending…' : 'Send to support'}
        </button>
      </form>
    </div>
  )
}
