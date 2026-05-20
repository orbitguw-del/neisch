import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Warehouse, ChevronRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Dashboard widget — stock at a glance.
// Shows the 5 materials with LOWEST current stock across the user's assigned
// sites (so depleting items naturally float to the top — no budget column
// needed; that lands later via v1.2).
// RLS already restricts to the user's sites. We just sort + limit.
export default function SiteStockWidget() {
  const navigate = useNavigate()
  const [materials, setMaterials] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let cancelled = false

    supabase
      .from('materials')
      .select(`
        id,
        name,
        unit,
        quantity_available,
        site:site_id (id, name)
      `)
      .order('quantity_available', { ascending: true, nullsFirst: false })
      .limit(5)
      .then(({ data }) => {
        if (!cancelled) {
          setMaterials((data ?? []).filter((m) => m.quantity_available != null))
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [])

  if (loading) return null
  if (materials.length === 0) return null

  // Heuristic "low" flag — flag the bottom row(s) visibly when stock is
  // small in absolute terms. Tuned for cement-bag scale; refine when
  // v1.2 ships budget_qty and we can do "low vs planned".
  const isLow = (qty) => Number(qty) < 20

  return (
    <div className="card overflow-hidden mb-4">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <div className="flex items-center gap-2">
          <Warehouse className="h-4 w-4 text-sage-600" />
          <h2 className="text-sm font-semibold text-gray-900">Stock at a glance</h2>
          <span className="text-xs text-gray-400">· lowest first</span>
        </div>
        <button
          onClick={() => navigate('/inventory')}
          className="text-xs font-medium text-brand-600 hover:text-brand-700"
        >
          View all →
        </button>
      </div>
      <div className="divide-y divide-gray-100">
        {materials.map((m) => {
          const low = isLow(m.quantity_available)
          return (
            <button
              key={m.id}
              onClick={() => navigate('/inventory')}
              className="flex w-full items-center gap-3 px-5 py-2.5 text-left hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{m.name}</p>
                <p className="text-xs text-gray-500 truncate">{m.site?.name ?? '—'}</p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p
                  className={
                    'text-sm font-semibold ' +
                    (low ? 'text-red-600' : 'text-gray-900')
                  }
                >
                  {Number(m.quantity_available).toLocaleString()}{' '}
                  <span className="font-normal text-gray-500">{m.unit ?? ''}</span>
                </p>
                {low && (
                  <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-[10px] font-medium text-red-700">
                    LOW
                  </span>
                )}
              </div>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
            </button>
          )
        })}
      </div>
    </div>
  )
}
