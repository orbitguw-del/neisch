import { useState } from 'react'
import { Search, Plus } from 'lucide-react'
import { MATERIAL_PRESETS, WORK_TYPES, WORK_TYPE_COLORS } from '@/lib/materialPresets'

// Step 1 of material creation — pick from preset list or go custom.
// Props:
//   onSelect(preset)  — called with a preset object when user picks one
//   onCustom()        — called when user clicks "Custom material"
export default function MaterialPresetPicker({ onSelect, onCustom }) {
  const [search,  setSearch]  = useState('')
  const [workTab, setWorkTab] = useState('all')

  const filtered = MATERIAL_PRESETS.filter((p) => {
    const matchesTab  = workTab === 'all' || p.work_type === workTab
    const matchesText = !search || p.name.toLowerCase().includes(search.toLowerCase())
    return matchesTab && matchesText
  })

  return (
    <div className="space-y-3">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400 pointer-events-none" />
        <input
          className="input pl-9"
          placeholder="Search material…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          autoFocus
        />
      </div>

      {/* Work type tabs */}
      <div className="flex gap-1.5 flex-wrap">
        <button
          onClick={() => setWorkTab('all')}
          className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
            workTab === 'all' ? 'bg-gray-800 text-white' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          All
        </button>
        {WORK_TYPES.map(({ value, label }) => (
          <button
            key={value}
            onClick={() => setWorkTab(value)}
            className={`px-2.5 py-1 rounded-full text-xs font-medium transition-colors ${
              workTab === value
                ? 'bg-gray-800 text-white'
                : `${WORK_TYPE_COLORS[value]} hover:opacity-80`
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {/* Preset grid */}
      <div className="max-h-64 overflow-y-auto space-y-1 pr-1">
        {filtered.length === 0 ? (
          <p className="text-sm text-gray-400 text-center py-6">No match — use Custom</p>
        ) : filtered.map((p, i) => (
          <button
            key={i}
            type="button"
            onClick={() => onSelect(p)}
            className="w-full flex items-center justify-between px-3 py-2.5 rounded-lg border border-gray-100 hover:border-brand-300 hover:bg-brand-50 transition-colors text-left"
          >
            <div className="min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">{p.name}</p>
              <p className="text-xs text-gray-400">{p.unit}</p>
            </div>
            <span className={`ml-2 flex-shrink-0 text-xs px-2 py-0.5 rounded-full font-medium ${WORK_TYPE_COLORS[p.work_type]}`}>
              {WORK_TYPES.find((w) => w.value === p.work_type)?.label}
            </span>
          </button>
        ))}
      </div>

      {/* Custom option */}
      <button
        type="button"
        onClick={onCustom}
        className="w-full flex items-center justify-center gap-2 py-2.5 rounded-lg border-2 border-dashed border-gray-200 text-sm text-gray-500 hover:border-brand-400 hover:text-brand-600 transition-colors"
      >
        <Plus className="h-4 w-4" /> Custom material
      </button>
    </div>
  )
}
