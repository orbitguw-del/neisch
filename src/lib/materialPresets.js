// Pre-fed material list for NE India construction.
// Used in the material creation form — user picks from here or creates custom.
// Fields map directly to the materials table columns.

export const WORK_TYPES = [
  { value: 'civil',        label: 'Civil' },
  { value: 'painting',     label: 'Painting' },
  { value: 'interior',     label: 'Interior' },
  { value: 'electrical',   label: 'Electrical' },
  { value: 'plumbing',     label: 'Plumbing' },
  { value: 'finishing',    label: 'Finishing' },
  { value: 'fabrication',  label: 'Fabrication' },
  { value: 'other',        label: 'Other' },
]

export const WORK_TYPE_COLORS = {
  civil:       'bg-amber-100 text-amber-700',
  painting:    'bg-blue-100 text-blue-700',
  interior:    'bg-purple-100 text-purple-700',
  electrical:  'bg-yellow-100 text-yellow-700',
  plumbing:    'bg-cyan-100 text-cyan-700',
  finishing:   'bg-green-100 text-green-700',
  fabrication: 'bg-gray-100 text-gray-700',
  other:       'bg-gray-100 text-gray-500',
}

// name, brand, unit, category, work_type
export const MATERIAL_PRESETS = [
  // ── Civil ────────────────────────────────────────────────────────────────────
  { name: 'OPC 53 Cement',        brand: null,         unit: 'bags',    category: 'consumable', work_type: 'civil' },
  { name: 'PPC Cement',           brand: null,         unit: 'bags',    category: 'consumable', work_type: 'civil' },
  { name: 'TMT Steel 8mm',        brand: null,         unit: 'kg',      category: 'consumable', work_type: 'civil' },
  { name: 'TMT Steel 10mm',       brand: null,         unit: 'kg',      category: 'consumable', work_type: 'civil' },
  { name: 'TMT Steel 12mm',       brand: null,         unit: 'kg',      category: 'consumable', work_type: 'civil' },
  { name: 'TMT Steel 16mm',       brand: null,         unit: 'kg',      category: 'consumable', work_type: 'civil' },
  { name: 'River Sand',           brand: null,         unit: 'cu ft',   category: 'consumable', work_type: 'civil' },
  { name: 'Crushed Stone 20mm',   brand: null,         unit: 'cu ft',   category: 'consumable', work_type: 'civil' },
  { name: 'Crushed Stone 40mm',   brand: null,         unit: 'cu ft',   category: 'consumable', work_type: 'civil' },
  { name: 'Fly Ash Bricks',       brand: null,         unit: 'nos',     category: 'consumable', work_type: 'civil' },
  { name: 'AAC Blocks',           brand: null,         unit: 'nos',     category: 'consumable', work_type: 'civil' },
  { name: 'Binding Wire',         brand: null,         unit: 'kg',      category: 'consumable', work_type: 'civil' },
  { name: 'Shuttering Ply 12mm',  brand: null,         unit: 'nos',     category: 'consumable', work_type: 'civil' },
  { name: 'Shuttering Oil',       brand: null,         unit: 'litres',  category: 'consumable', work_type: 'civil' },
  { name: 'Nails Assorted',       brand: null,         unit: 'kg',      category: 'consumable', work_type: 'civil' },
  { name: 'Coarse Aggregate',     brand: null,         unit: 'cu ft',   category: 'consumable', work_type: 'civil' },

  // ── Painting ─────────────────────────────────────────────────────────────────
  { name: 'Exterior Emulsion',    brand: null,         unit: 'litres',  category: 'consumable', work_type: 'painting' },
  { name: 'Interior Emulsion',    brand: null,         unit: 'litres',  category: 'consumable', work_type: 'painting' },
  { name: 'Primer',               brand: null,         unit: 'litres',  category: 'consumable', work_type: 'painting' },
  { name: 'Wall Putty',           brand: null,         unit: 'bags',    category: 'consumable', work_type: 'painting' },
  { name: 'Enamel Paint',         brand: null,         unit: 'litres',  category: 'consumable', work_type: 'painting' },
  { name: 'Paint Thinner',        brand: null,         unit: 'litres',  category: 'consumable', work_type: 'painting' },
  { name: 'Texture Paint',        brand: null,         unit: 'kg',      category: 'consumable', work_type: 'painting' },

  // ── Interior ─────────────────────────────────────────────────────────────────
  { name: 'Ceramic Floor Tiles',  brand: null,         unit: 'sq ft',   category: 'consumable', work_type: 'interior' },
  { name: 'Wall Tiles',           brand: null,         unit: 'sq ft',   category: 'consumable', work_type: 'interior' },
  { name: 'Vitrified Tiles',      brand: null,         unit: 'sq ft',   category: 'consumable', work_type: 'interior' },
  { name: 'Tile Adhesive',        brand: null,         unit: 'bags',    category: 'consumable', work_type: 'interior' },
  { name: 'Tile Grout',           brand: null,         unit: 'kg',      category: 'consumable', work_type: 'interior' },
  { name: 'Flush Door',           brand: null,         unit: 'nos',     category: 'consumable', work_type: 'interior' },
  { name: 'Door Frame (Timber)',  brand: null,         unit: 'nos',     category: 'consumable', work_type: 'interior' },
  { name: 'Plywood 18mm',         brand: null,         unit: 'nos',     category: 'consumable', work_type: 'interior' },
  { name: 'Gypsum Board',         brand: null,         unit: 'nos',     category: 'consumable', work_type: 'interior' },

  // ── Electrical ───────────────────────────────────────────────────────────────
  { name: 'PVC Wire 1.5mm',       brand: null,         unit: 'metres',  category: 'consumable', work_type: 'electrical' },
  { name: 'PVC Wire 2.5mm',       brand: null,         unit: 'metres',  category: 'consumable', work_type: 'electrical' },
  { name: 'PVC Wire 4mm',         brand: null,         unit: 'metres',  category: 'consumable', work_type: 'electrical' },
  { name: 'PVC Conduit 20mm',     brand: null,         unit: 'metres',  category: 'consumable', work_type: 'electrical' },
  { name: 'MCB 6A',               brand: null,         unit: 'nos',     category: 'equipment',  work_type: 'electrical' },
  { name: 'MCB 16A',              brand: null,         unit: 'nos',     category: 'equipment',  work_type: 'electrical' },
  { name: 'Distribution Board',   brand: null,         unit: 'nos',     category: 'equipment',  work_type: 'electrical' },
  { name: 'Modular Switch Box',   brand: null,         unit: 'nos',     category: 'consumable', work_type: 'electrical' },

  // ── Plumbing ─────────────────────────────────────────────────────────────────
  { name: 'CPVC Pipe 1/2"',       brand: null,         unit: 'metres',  category: 'consumable', work_type: 'plumbing' },
  { name: 'CPVC Pipe 3/4"',       brand: null,         unit: 'metres',  category: 'consumable', work_type: 'plumbing' },
  { name: 'uPVC Pipe 4"',         brand: null,         unit: 'metres',  category: 'consumable', work_type: 'plumbing' },
  { name: 'uPVC Pipe 6"',         brand: null,         unit: 'metres',  category: 'consumable', work_type: 'plumbing' },
  { name: 'Ball Valve 1/2"',      brand: null,         unit: 'nos',     category: 'equipment',  work_type: 'plumbing' },
  { name: 'Gate Valve 1"',        brand: null,         unit: 'nos',     category: 'equipment',  work_type: 'plumbing' },
  { name: 'PVC Elbow 1/2"',       brand: null,         unit: 'nos',     category: 'consumable', work_type: 'plumbing' },
  { name: 'PVC Tee 1/2"',         brand: null,         unit: 'nos',     category: 'consumable', work_type: 'plumbing' },

  // ── Finishing ────────────────────────────────────────────────────────────────
  { name: 'Waterproofing Compound', brand: null,       unit: 'kg',      category: 'consumable', work_type: 'finishing' },
  { name: 'Wall Plaster',          brand: null,        unit: 'bags',    category: 'consumable', work_type: 'finishing' },
  { name: 'Floor Hardener',        brand: null,        unit: 'kg',      category: 'consumable', work_type: 'finishing' },
  { name: 'Sealant / Caulk',       brand: null,        unit: 'nos',     category: 'consumable', work_type: 'finishing' },
  { name: 'Expansion Joint Strip', brand: null,        unit: 'metres',  category: 'consumable', work_type: 'finishing' },

  // ── Fabrication ──────────────────────────────────────────────────────────────
  { name: 'MS Angle 40×40mm',     brand: null,         unit: 'kg',      category: 'consumable', work_type: 'fabrication' },
  { name: 'MS Flat 50×6mm',       brand: null,         unit: 'kg',      category: 'consumable', work_type: 'fabrication' },
  { name: 'MS Pipe 2"',           brand: null,         unit: 'metres',  category: 'consumable', work_type: 'fabrication' },
  { name: 'MS Plate 3mm',         brand: null,         unit: 'kg',      category: 'consumable', work_type: 'fabrication' },
  { name: 'Welding Electrodes',   brand: null,         unit: 'kg',      category: 'consumable', work_type: 'fabrication' },
  { name: 'GI Wire Mesh',         brand: null,         unit: 'sq ft',   category: 'consumable', work_type: 'fabrication' },
]
