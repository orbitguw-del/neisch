import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Package, ChevronRight, Plus } from 'lucide-react'
import { supabase } from '@/lib/supabase'

// Dashboard widget — material allocations the logged-in user has logged today.
// Tenant + site visibility is scoped automatically by RLS; we just filter by
// `allocated_by = profileId` and `allocated_date = today`.
export default function AllocationsTodayWidget({ profileId }) {
  const navigate = useNavigate()
  const [allocations, setAllocations] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!profileId) return
    let cancelled = false
    const _d = new Date()
    const today = `${_d.getFullYear()}-${String(_d.getMonth() + 1).padStart(2, '0')}-${String(_d.getDate()).padStart(2, '0')}`

    supabase
      .from('material_allocations')
      .select(`
        id,
        work_description,
        quantity_allocated,
        allocated_date,
        created_at,
        material:material_id (id, name, unit),
        site:site_id (id, name)
      `)
      .eq('allocated_by', profileId)
      .eq('allocated_date', today)
      .order('created_at', { ascending: false })
      .limit(20)
      .then(({ data }) => {
        if (!cancelled) {
          setAllocations(data ?? [])
          setLoading(false)
        }
      })

    return () => { cancelled = true }
  }, [profileId])

  if (loading) return null

  return (
    <div className="card overflow-hidden mb-4">
      <div className="flex items-center justify-between border-b border-gray-200 px-5 py-3">
        <div className="flex items-center gap-2">
          <Package className="h-4 w-4 text-brand-600" />
          <h2 className="text-sm font-semibold text-gray-900">
            Material allocated by you today
          </h2>
          {allocations.length > 0 && (
            <span className="text-xs text-gray-400">· {allocations.length}</span>
          )}
        </div>
        <button
          onClick={() => navigate('/inventory')}
          className="inline-flex items-center gap-1 rounded-md bg-brand-50 px-2.5 py-1 text-xs font-medium text-brand-700 hover:bg-brand-100"
        >
          <Plus className="h-3 w-3" /> Allocate
        </button>
      </div>

      {allocations.length === 0 ? (
        <p className="px-5 py-6 text-center text-sm text-gray-500">
          No material allocated today yet.
        </p>
      ) : (
        <div className="divide-y divide-gray-100">
          {allocations.map((a) => (
            <button
              key={a.id}
              onClick={() => navigate('/inventory')}
              className="flex w-full items-center gap-3 px-5 py-2.5 text-left hover:bg-gray-50"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {a.material?.name ?? 'Material'}
                  <span className="ml-2 text-gray-500 font-normal">
                    {Number(a.quantity_allocated).toLocaleString()} {a.material?.unit ?? ''}
                  </span>
                </p>
                {a.work_description && (
                  <p className="text-xs text-gray-500 truncate">{a.work_description}</p>
                )}
              </div>
              <span className="text-xs text-gray-400 flex-shrink-0">
                {a.site?.name ?? ''}
              </span>
              <ChevronRight className="h-4 w-4 flex-shrink-0 text-gray-300" />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
