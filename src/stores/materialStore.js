import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

const useMaterialStore = create((set) => ({
  materials: [],
  loading: false,
  error: null,

  fetchMaterials: async (siteId) => {
    set({ loading: true, error: null })
    const { data, error } = await supabase
      .from('materials')
      .select('*')
      .eq('site_id', siteId)
      .order('name')
    set({ materials: data ?? [], loading: false, error: error?.message ?? null })
  },

  createMaterial: async (payload) => {
    const { data, error } = await supabase
      .from('materials')
      .insert(payload)
      .select()
      .single()
    if (error) throw error

    // Write opening stock transaction if initial quantity > 0
    const initialQty = Number(payload.quantity_available) || 0
    if (initialQty > 0) {
      await supabase.from('material_transactions').insert({
        material_id:   data.id,
        site_id:       data.site_id,
        tenant_id:     data.tenant_id,
        txn_type:      'opening',
        quantity:      initialQty,
        ref_type:      'opening',
        balance_after: initialQty,
        note:          'Opening stock — initial entry',
        created_by:    payload.created_by ?? null,
      })
      await supabase.from('materials')
        .update({ opening_stock_recorded: true })
        .eq('id', data.id)
    }

    set((s) => ({ materials: [...s.materials, { ...data, opening_stock_recorded: initialQty > 0 }] }))
    return data
  },

  updateMaterial: async (materialId, payload) => {
    const { data, error } = await supabase
      .from('materials')
      .update(payload)
      .eq('id', materialId)
      .select()
      .single()
    if (error) throw error
    set((s) => ({
      materials: s.materials.map((m) => (m.id === materialId ? data : m)),
    }))
    return data
  },

  deleteMaterial: async (materialId) => {
    // Guard: reject if any non-retired equipment assets exist
    const { count } = await supabase
      .from('equipment_assets')
      .select('id', { count: 'exact', head: true })
      .eq('material_id', materialId)
      .neq('status', 'retired')
    if (count > 0) throw new Error(`Cannot delete: ${count} active equipment asset(s) exist. Retire all assets first.`)

    const { error } = await supabase.from('materials').delete().eq('id', materialId)
    if (error) throw error
    set((s) => ({ materials: s.materials.filter((m) => m.id !== materialId) }))
  },
}))

export default useMaterialStore
