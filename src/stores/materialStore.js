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
    if (error) {
      if (error.code === '23505') {
        const brand = payload.brand ? `${payload.brand} — ` : ''
        throw new Error(`"${brand}${payload.name}" already exists at this site. Add more stock via a Receipt instead.`)
      }
      throw error
    }

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

  setOpeningStock: async (materialId, qty, profileId) => {
    const now = new Date().toISOString()
    const { data: mat, error: mErr } = await supabase
      .from('materials').select('*').eq('id', materialId).single()
    if (mErr) throw mErr

    const { error: uErr } = await supabase.from('materials').update({
      quantity_available:    qty,
      opening_stock_recorded: true,
      updated_at:            now,
    }).eq('id', materialId)
    if (uErr) throw uErr

    await supabase.from('material_transactions').insert({
      material_id:   materialId,
      site_id:       mat.site_id,
      tenant_id:     mat.tenant_id,
      txn_type:      'opening',
      quantity:      qty,
      ref_type:      'opening',
      balance_after: qty,
      note:          'Opening stock — set by superadmin during onboarding',
      created_by:    profileId ?? null,
    })

    set((s) => ({
      materials: s.materials.map((m) =>
        m.id === materialId ? { ...m, quantity_available: qty, opening_stock_recorded: true } : m
      ),
    }))
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
