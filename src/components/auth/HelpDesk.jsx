import { useState } from 'react'
import { LifeBuoy, Mail, X } from 'lucide-react'

const SUPPORT_EMAIL = 'help@storeyinfra.com'

export default function HelpDesk() {
  const [open, setOpen]       = useState(false)
  const [message, setMessage] = useState('')
  const [name, setName]       = useState('')
  const [email, setEmail]     = useState('')

  const handleSend = (e) => {
    e.preventDefault()
    const subject = encodeURIComponent('Storey support request')
    const lines = [
      name  && `Name: ${name}`,
      email && `Email: ${email}`,
      '',
      message,
    ].filter((l) => l !== undefined).join('\n')
    const body = encodeURIComponent(lines)
    window.location.href = `mailto:${SUPPORT_EMAIL}?subject=${subject}&body=${body}`
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
          Need help signing in?
        </button>
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
          onClick={() => setOpen(false)}
          aria-label="Close support form"
          className="text-gray-400 hover:text-gray-600"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <p className="mb-3 text-xs text-gray-500">
        Email us directly at{' '}
        <a
          href={`mailto:${SUPPORT_EMAIL}`}
          className="font-medium text-brand-600 hover:underline"
        >
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
          />
          <input
            type="email"
            className="input text-sm"
            placeholder="Your email (optional)"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <textarea
          rows={3}
          className="input text-sm"
          placeholder="Briefly describe your issue…"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn-primary w-full text-sm py-2 flex items-center justify-center gap-1.5"
        >
          <Mail className="h-4 w-4" />
          Open email & send
        </button>
      </form>
    </div>
  )
}
