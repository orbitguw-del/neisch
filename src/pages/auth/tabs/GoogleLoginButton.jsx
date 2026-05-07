import { Chrome } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { useState } from 'react'

export default function GoogleLoginButton({ label = 'Continue with Google' }) {
  const [error, setError] = useState('')

  const handleGoogle = async () => {
    setError('')
    const { error: oauthError } = await supabase.auth.signInWithOAuth({
      provider: 'google',
      options: { redirectTo: `${window.location.origin}/auth/callback` },
    })
    if (oauthError) setError(oauthError.message)
  }

  return (
    <div className="space-y-2">
      <button
        type="button"
        onClick={handleGoogle}
        className="flex w-full items-center justify-center gap-3 rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 transition-colors"
      >
        <Chrome className="h-4 w-4" />
        {label}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
    </div>
  )
}
