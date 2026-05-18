import { useEffect, useState } from 'react'
import { ImageIcon, X } from 'lucide-react'
import { getPhotoUrl } from '@/lib/photos'

/**
 * Displays a stored photo from its Storage path via a signed URL.
 * Click the thumbnail to open it full-size in a lightbox.
 *
 * Props:
 *   path       — Storage path, or null
 *   size       — pixel size of the square thumb (default 48)
 *   className  — extra classes
 */
export default function PhotoThumb({ path, size = 48, className = '' }) {
  const [url, setUrl]   = useState(null)
  const [open, setOpen] = useState(false)

  useEffect(() => {
    let cancelled = false
    if (!path) { setUrl(null); return }
    getPhotoUrl(path).then((u) => { if (!cancelled) setUrl(u) })
    return () => { cancelled = true }
  }, [path])

  const style = { width: size, height: size }

  if (!path) {
    return (
      <div
        style={style}
        className={`flex items-center justify-center rounded-md bg-gray-100 text-gray-300 ${className}`}
      >
        <ImageIcon className="h-4 w-4" />
      </div>
    )
  }

  return (
    <>
      <img
        src={url ?? undefined}
        alt="Site photo"
        style={style}
        onClick={() => setOpen(true)}
        className={`rounded-md border border-gray-200 object-cover cursor-zoom-in ${className}`}
      />

      {open && (
        <div
          className="no-print fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4"
          onClick={() => setOpen(false)}
        >
          <button
            type="button"
            onClick={() => setOpen(false)}
            className="absolute right-4 top-4 rounded-full bg-white/10 p-2 text-white hover:bg-white/20"
            aria-label="Close photo"
          >
            <X className="h-5 w-5" />
          </button>
          <img
            src={url ?? undefined}
            alt="Site photo — full size"
            onClick={(e) => e.stopPropagation()}
            className="max-h-[90vh] max-w-[92vw] rounded-lg object-contain shadow-2xl"
          />
        </div>
      )}
    </>
  )
}
