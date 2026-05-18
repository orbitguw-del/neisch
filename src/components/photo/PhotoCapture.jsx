import { useState } from 'react'
import { Camera, X, Loader2 } from 'lucide-react'
import { capturePhoto } from '@/lib/photos'

/**
 * Capture-a-photo form field. Lets the user take/pick one photo and shows a
 * preview. Hands the raw Blob back via onChange — the parent form uploads it
 * on submit (so the upload can be queued offline alongside the record).
 *
 * Props:
 *   value     — Blob | null (the captured photo)
 *   onChange  — (Blob | null) => void
 *   label     — field label (default "Photo")
 */
export default function PhotoCapture({ value, onChange, label = 'Photo' }) {
  const [busy, setBusy]   = useState(false)
  const [error, setError] = useState(null)
  const previewUrl = value ? URL.createObjectURL(value) : null

  const handleCapture = async () => {
    setError(null)
    setBusy(true)
    try {
      const blob = await capturePhoto()
      if (blob) onChange(blob)
    } catch (err) {
      setError(err?.message ?? 'Could not capture photo')
    } finally {
      setBusy(false)
    }
  }

  return (
    <div>
      <label className="label">{label}</label>
      {previewUrl ? (
        <div className="relative inline-block">
          <img
            src={previewUrl}
            alt="Captured"
            className="h-32 w-32 rounded-lg border border-gray-200 object-cover"
          />
          <button
            type="button"
            onClick={() => onChange(null)}
            className="absolute -right-2 -top-2 rounded-full bg-white border border-gray-300 p-1 shadow-sm hover:bg-gray-50"
            aria-label="Remove photo"
          >
            <X className="h-3.5 w-3.5 text-gray-600" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleCapture}
          disabled={busy}
          className="flex h-32 w-32 flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-6 w-6 animate-spin" /> : <Camera className="h-6 w-6" />}
          <span className="text-xs font-medium">{busy ? 'Opening…' : 'Add photo'}</span>
        </button>
      )}
      {error && <p className="mt-1 text-xs text-red-600">{error}</p>}
    </div>
  )
}
