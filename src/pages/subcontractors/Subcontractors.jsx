import { useState, useEffect, useCallback } from 'react'
import { Plus, HardHat, Phone, ChevronDown, X, Camera, Users } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { capturePhoto, uploadPhoto, getPhotoUrl } from '@/lib/photos'
import useAuthStore from '@/stores/authStore'

const PRESET_TYPES = [
  'Civil Work', 'Electrical', 'Plumbing', 'Painting',
  'Waterproofing', 'Fabrication', 'Carpentry', 'Tiling / Flooring',
  'Masonry', 'Glazing', 'HVAC', 'Other',
]

const TYPE_COLORS = {
  'Civil Work':       'bg-amber-50 text-amber-700 border-amber-200',
  'Electrical':       'bg-yellow-50 text-yellow-700 border-yellow-200',
  'Plumbing':         'bg-blue-50 text-blue-700 border-blue-200',
  'Painting':         'bg-pink-50 text-pink-700 border-pink-200',
  'Waterproofing':    'bg-cyan-50 text-cyan-700 border-cyan-200',
  'Fabrication':      'bg-zinc-50 text-zinc-700 border-zinc-200',
  'Carpentry':        'bg-orange-50 text-orange-700 border-orange-200',
  'Tiling / Flooring':'bg-stone-50 text-stone-700 border-stone-200',
  'Masonry':          'bg-red-50 text-red-700 border-red-200',
  'Glazing':          'bg-sky-50 text-sky-700 border-sky-200',
  'HVAC':             'bg-teal-50 text-teal-700 border-teal-200',
}
const typeColor = (t) => TYPE_COLORS[t] ?? 'bg-gray-50 text-gray-700 border-gray-200'

// ── Add Sub-contractor Modal ──────────────────────────────────────────────────
function AddSubcontractorModal({ tenantId, onClose, onAdded }) {
  const [name,       setName]       = useState('')
  const [phone,      setPhone]      = useState('')
  const [typeSelect, setTypeSelect] = useState('')
  const [typeCustom, setTypeCustom] = useState('')
  const [loading,    setLoading]    = useState(false)
  const [error,      setError]      = useState('')

  const type = typeSelect === 'Other' ? typeCustom.trim() : typeSelect

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!type) { setError('Please select or enter a type'); return }
    setLoading(true); setError('')
    const { data, error: err } = await supabase
      .from('subcontractors')
      .insert({ tenant_id: tenantId, name: name.trim(), phone: phone.trim() || null, type })
      .select().single()
    setLoading(false)
    if (err) { setError(err.message); return }
    onAdded(data)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-base font-bold text-gray-900">Add Sub-contractor</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        {error && <p className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Name *</label>
            <input className="input" placeholder="e.g. Sharma Electrical Works" value={name} onChange={e => setName(e.target.value)} required />
          </div>
          <div>
            <label className="label">Mobile number</label>
            <input className="input" type="tel" inputMode="numeric" placeholder="98765 43210" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))} maxLength={10} />
          </div>
          <div>
            <label className="label">Type of work *</label>
            <select className="input" value={typeSelect} onChange={e => setTypeSelect(e.target.value)} required>
              <option value="">Select type…</option>
              {PRESET_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
          {typeSelect === 'Other' && (
            <div>
              <label className="label">Specify type *</label>
              <input className="input" placeholder="e.g. Roofing" value={typeCustom} onChange={e => setTypeCustom(e.target.value)} required />
            </div>
          )}
          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Adding…' : 'Add Sub-contractor'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Log Labour Modal ──────────────────────────────────────────────────────────
function LogLabourModal({ subcontractor, sites, tenantId, profileId, onClose, onLogged }) {
  const [siteId,    setSiteId]    = useState(sites[0]?.id ?? '')
  const [date,      setDate]      = useState(new Date().toISOString().slice(0, 10))
  const [headcount, setHeadcount] = useState('')
  const [notes,     setNotes]     = useState('')
  const [photos,    setPhotos]    = useState([])   // { blob, url }
  const [loading,   setLoading]   = useState(false)
  const [error,     setError]     = useState('')

  const addPhoto = async () => {
    const blob = await capturePhoto()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    setPhotos(p => [...p, { blob, url }])
  }

  const removePhoto = (i) => setPhotos(p => p.filter((_, idx) => idx !== i))

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (!siteId) { setError('Select a site'); return }
    const count = parseInt(headcount, 10)
    if (!count || count < 1) { setError('Enter headcount'); return }
    setLoading(true); setError('')

    const site = sites.find(s => s.id === siteId)

    // Upsert the log (same sub + site + date → update headcount)
    const { data: log, error: logErr } = await supabase
      .from('subcontractor_daily_logs')
      .upsert({
        tenant_id:        tenantId,
        site_id:          siteId,
        subcontractor_id: subcontractor.id,
        date,
        headcount:        count,
        notes:            notes.trim() || null,
        logged_by:        profileId,
      }, { onConflict: 'site_id,subcontractor_id,date' })
      .select().single()

    if (logErr) { setError(logErr.message); setLoading(false); return }

    // Upload photos
    for (const p of photos) {
      const path = await uploadPhoto({ blob: p.blob, tenantId, siteId, entity: 'subcontractor-labour' })
      await supabase.from('subcontractor_labour_photos').insert({ log_id: log.id, photo_path: path })
    }

    setLoading(false)
    onLogged()
    onClose()
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl p-6 max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-base font-bold text-gray-900">Log Labour</h2>
          <button onClick={onClose} className="rounded-lg p-1.5 text-gray-400 hover:bg-gray-100"><X className="h-4 w-4" /></button>
        </div>
        <p className="text-sm text-brand-600 font-medium mb-5">{subcontractor.name}</p>
        {error && <p className="mb-3 rounded-lg bg-red-50 border border-red-200 px-3 py-2 text-sm text-red-700">{error}</p>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="label">Site *</label>
            <select className="input" value={siteId} onChange={e => setSiteId(e.target.value)} required>
              {sites.map(s => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>
          <div>
            <label className="label">Date</label>
            <input className="input" type="date" value={date} onChange={e => setDate(e.target.value)} required />
          </div>
          <div>
            <label className="label">Number of labourers present *</label>
            <input className="input text-2xl font-bold text-center" type="number" inputMode="numeric" min={1} max={999}
              placeholder="0" value={headcount} onChange={e => setHeadcount(e.target.value)} required />
          </div>
          <div>
            <label className="label">Notes (optional)</label>
            <input className="input" placeholder="e.g. Started foundation work" value={notes} onChange={e => setNotes(e.target.value)} />
          </div>

          {/* Photos */}
          <div>
            <label className="label">Labour photos (optional)</label>
            <div className="grid grid-cols-3 gap-2 mb-2">
              {photos.map((p, i) => (
                <div key={i} className="relative aspect-square rounded-xl overflow-hidden border border-gray-200">
                  <img src={p.url} alt="" className="w-full h-full object-cover" />
                  <button type="button" onClick={() => removePhoto(i)}
                    className="absolute top-1 right-1 rounded-full bg-black/50 p-0.5 text-white">
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={addPhoto}
                className="aspect-square rounded-xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center gap-1 text-gray-400 hover:border-brand-300 hover:text-brand-500 transition-colors">
                <Camera className="h-5 w-5" />
                <span className="text-xs">Add</span>
              </button>
            </div>
            <p className="text-xs text-gray-400">Add one photo per labourer as proof of attendance</p>
          </div>

          <button type="submit" disabled={loading} className="btn-primary w-full">
            {loading ? 'Saving…' : 'Save Log'}
          </button>
        </form>
      </div>
    </div>
  )
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function Subcontractors() {
  const { profile } = useAuthStore()
  const tenantId  = profile?.tenant_id
  const role      = profile?.role
  const isContractor = ['contractor', 'superadmin'].includes(role)

  const [subcontractors, setSubcontractors] = useState([])
  const [sites,          setSites]          = useState([])
  const [logs,           setLogs]           = useState([])
  const [loading,        setLoading]        = useState(true)
  const [showAddModal,   setShowAddModal]   = useState(false)
  const [logTarget,      setLogTarget]      = useState(null) // subcontractor to log for

  const load = useCallback(async () => {
    if (!tenantId) return
    setLoading(true)

    const [{ data: scs }, { data: si }, { data: lg }] = await Promise.all([
      supabase.from('subcontractors').select('*').eq('tenant_id', tenantId).order('name'),
      supabase.from('sites').select('id, name').eq('tenant_id', tenantId).order('name'),
      supabase.from('subcontractor_daily_logs')
        .select('*, subcontractors(name, type), sites(name), subcontractor_labour_photos(id, photo_path)')
        .eq('tenant_id', tenantId)
        .order('date', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(50),
    ])

    setSubcontractors(scs ?? [])
    setSites(si ?? [])
    setLogs(lg ?? [])
    setLoading(false)
  }, [tenantId])

  useEffect(() => { load() }, [load])

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="h-8 w-8 rounded-full border-4 border-brand-600 border-t-transparent animate-spin" />
    </div>
  )

  return (
    <div className="space-y-6 max-w-2xl mx-auto">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Sub-contractors</h1>
          <p className="text-sm text-gray-500">Manage sub-contractors and log daily labour</p>
        </div>
        {isContractor && (
          <button onClick={() => setShowAddModal(true)} className="btn-primary flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add
          </button>
        )}
      </div>

      {/* Directory */}
      {subcontractors.length === 0 ? (
        <div className="card p-8 text-center space-y-3">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-50">
            <HardHat className="h-7 w-7 text-brand-600" />
          </div>
          <p className="font-semibold text-gray-900">No sub-contractors yet</p>
          {isContractor && (
            <p className="text-sm text-gray-500">Add your first sub-contractor to start logging daily labour.</p>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {subcontractors.map(sc => (
            <div key={sc.id} className="card p-4 flex items-center gap-4">
              {/* Type colour stripe */}
              <div className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border text-lg font-bold ${typeColor(sc.type)}`}>
                {sc.name.charAt(0).toUpperCase()}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 truncate">{sc.name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <span className={`inline-flex items-center rounded-full border px-2 py-0.5 text-xs font-medium ${typeColor(sc.type)}`}>
                    {sc.type}
                  </span>
                  {sc.phone && (
                    <span className="flex items-center gap-1 text-xs text-gray-500">
                      <Phone className="h-3 w-3" />{sc.phone}
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setLogTarget(sc)}
                className="shrink-0 flex items-center gap-1.5 rounded-xl bg-brand-50 border border-brand-200 px-3 py-2 text-sm font-semibold text-brand-700 hover:bg-brand-100 transition-colors"
              >
                <Users className="h-3.5 w-3.5" />
                Log
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Recent logs */}
      {logs.length > 0 && (
        <div>
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500 mb-3">Recent Labour Logs</h2>
          <div className="space-y-3">
            {logs.map(log => (
              <LogCard key={log.id} log={log} />
            ))}
          </div>
        </div>
      )}

      {/* Modals */}
      {showAddModal && (
        <AddSubcontractorModal
          tenantId={tenantId}
          onClose={() => setShowAddModal(false)}
          onAdded={sc => setSubcontractors(p => [sc, ...p])}
        />
      )}
      {logTarget && (
        <LogLabourModal
          subcontractor={logTarget}
          sites={sites}
          tenantId={tenantId}
          profileId={profile?.id}
          onClose={() => setLogTarget(null)}
          onLogged={load}
        />
      )}
    </div>
  )
}

// ── Log Card ──────────────────────────────────────────────────────────────────
function LogCard({ log }) {
  const [photoUrls, setPhotoUrls] = useState([])

  useEffect(() => {
    if (!log.subcontractor_labour_photos?.length) return
    Promise.all(log.subcontractor_labour_photos.map(p => getPhotoUrl(p.photo_path)))
      .then(urls => setPhotoUrls(urls.filter(Boolean)))
  }, [log])

  return (
    <div className="card p-4 space-y-3">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-gray-900">{log.subcontractors?.name}</p>
          <p className="text-xs text-gray-500 mt-0.5">
            {log.sites?.name} · {new Date(log.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
          </p>
          {log.notes && <p className="text-xs text-gray-500 mt-1 italic">"{log.notes}"</p>}
        </div>
        <div className="flex flex-col items-center shrink-0 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2 min-w-[52px]">
          <span className="text-2xl font-bold text-amber-700 leading-none">{log.headcount}</span>
          <span className="text-xs text-amber-600 mt-0.5">labour</span>
        </div>
      </div>
      {photoUrls.length > 0 && (
        <div className="grid grid-cols-4 gap-1.5">
          {photoUrls.map((url, i) => (
            <div key={i} className="aspect-square rounded-lg overflow-hidden border border-gray-100">
              <img src={url} alt="" className="w-full h-full object-cover" />
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
