import { create } from 'zustand'
import { supabase } from '@/lib/supabase'

async function enrichAssets(list) {
  if (!list.length) return list
  const materialIds = [...new Set(list.map((a) => a.material_id).filter(Boolean))]
  const siteIds     = [...new Set(list.map((a) => a.site_id).filter(Boolean))]
  const profileIds  = [...new Set([
    ...list.map((a) => a.created_by),
    ...list.map((a) => a.current_assignee_id),
  ].filter(Boolean))]

  const [mRes, sRes, pRes] = await Promise.all([
    materialIds.length ? supabase.from('materials').select('id, name, unit').in('id', materialIds) : { data: [] },
    siteIds.length     ? supabase.from('sites').select('id, name').in('id', siteIds)              : { data: [] },
    profileIds.length  ? supabase.from('profiles').select('id, full_name').in('id', profileIds)   : { data: [] },
  ])

  const mMap = Object.fromEntries((mRes.data ?? []).map((m) => [m.id, m]))
  const sMap = Object.fromEntries((sRes.data ?? []).map((s) => [s.id, s]))
  const pMap = Object.fromEntries((pRes.data ?? []).map((p) => [p.id, p]))

  return list.map((a) => ({
    ...a,
    material:           mMap[a.material_id]       ?? null,
    site:               sMap[a.site_id]            ?? null,
    created_by_profile: pMap[a.created_by]         ?? null,
    assignee_profile:   pMap[a.current_assignee_id] ?? null,
  }))
}

const useEquipmentAssetStore = create((set) => ({
  assets:      [],
  loading:     false,
  assetDetail: null,
  assignments: [],
  maintenance: [],

  fetchAssets: async (tenantId, filters = {}) => {
    set({ loading: true })
    let q = supabase.from('equipment_assets').select('*').eq('tenant_id', tenantId).order('asset_code')
    if (filters.siteId)     q = q.eq('site_id', filters.siteId)
    if (filters.status)     q = q.eq('status', filters.status)
    if (filters.materialId) q = q.eq('material_id', filters.materialId)
    const { data, error } = await q
    if (error) { set({ loading: false }); throw error }
    const enriched = await enrichAssets(data ?? [])
    set({ assets: enriched, loading: false })
  },

  fetchAsset: async (assetId) => {
    const { data, error } = await supabase
      .from('equipment_assets').select('*').eq('id', assetId).single()
    if (error) throw error
    const [enriched] = await enrichAssets([data])
    set({ assetDetail: enriched })
    return enriched
  },

  fetchAssignmentHistory: async (assetId) => {
    const { data, error } = await supabase
      .from('equipment_assignments').select('*')
      .eq('asset_id', assetId).order('assigned_at', { ascending: false })
    if (error) throw error
    const profileIds = [...new Set([
      ...( data ?? []).map((a) => a.assigned_to_profile),
      ...(data ?? []).map((a) => a.assigned_by),
    ].filter(Boolean))]
    let pMap = {}
    if (profileIds.length) {
      const { data: profiles } = await supabase.from('profiles').select('id, full_name').in('id', profileIds)
      pMap = Object.fromEntries((profiles ?? []).map((p) => [p.id, p]))
    }
    const enriched = (data ?? []).map((a) => ({
      ...a,
      assigned_to_profile_obj: pMap[a.assigned_to_profile] ?? null,
      assigned_by_profile:     pMap[a.assigned_by]         ?? null,
    }))
    set({ assignments: enriched })
    return enriched
  },

  fetchMaintenanceHistory: async (assetId) => {
    const { data, error } = await supabase
      .from('equipment_maintenance').select('*')
      .eq('asset_id', assetId).order('service_date', { ascending: false })
    if (error) throw error
    set({ maintenance: data ?? [] })
    return data ?? []
  },

  createAsset: async (payload) => {
    // Get next asset code
    const { data: code, error: cErr } = await supabase
      .rpc('next_asset_code', { p_tenant_id: payload.tenant_id })
    if (cErr) throw cErr
    const { data, error } = await supabase
      .from('equipment_assets')
      .insert({ ...payload, asset_code: code })
      .select('*').single()
    if (error) throw error
    const [enriched] = await enrichAssets([data])
    set((s) => ({ assets: [...s.assets, enriched] }))
    return enriched
  },

  /**
   * Called at GRN confirmation for equipment category materials.
   * Creates `count` asset rows, using provided serial numbers where available.
   */
  bulkCreateAssets: async ({ materialId, siteId, tenantId, grnReceiptId, count, serials, make, model, createdBy }) => {
    const created = []
    for (let i = 0; i < count; i++) {
      const { data: code, error: cErr } = await supabase
        .rpc('next_asset_code', { p_tenant_id: tenantId })
      if (cErr) throw cErr
      const { data, error } = await supabase
        .from('equipment_assets')
        .insert({
          asset_code:    code,
          material_id:   materialId,
          site_id:       siteId,
          tenant_id:     tenantId,
          grn_receipt_id: grnReceiptId,
          serial_number: serials[i] || null,
          make:          make || null,
          model:         model || null,
          created_by:    createdBy,
        })
        .select('*').single()
      if (error) throw error
      created.push(data)
    }
    const enriched = await enrichAssets(created)
    set((s) => ({ assets: [...s.assets, ...enriched] }))
    return enriched
  },

  updateAsset: async (assetId, payload) => {
    const now = new Date().toISOString()
    const { data, error } = await supabase
      .from('equipment_assets')
      .update({ ...payload, updated_at: now })
      .eq('id', assetId).select('*').single()
    if (error) throw error
    const [enriched] = await enrichAssets([data])
    set((s) => ({
      assets: s.assets.map((a) => (a.id === assetId ? enriched : a)),
      assetDetail: s.assetDetail?.id === assetId ? enriched : s.assetDetail,
    }))
    return enriched
  },

  /**
   * Assign asset to a person/zone.
   * Creates equipment_assignments row, updates asset denormalised fields.
   */
  assignAsset: async (assetId, { assignedToProfileId, assignedToName, zone, assignedBy }) => {
    const now = new Date().toISOString()
    const asset = (await supabase.from('equipment_assets').select('*').eq('id', assetId).single()).data
    if (!asset) throw new Error('Asset not found')

    // Close any open assignment
    await supabase.from('equipment_assignments')
      .update({ returned_at: now })
      .eq('asset_id', assetId)
      .is('returned_at', null)

    // New assignment record
    await supabase.from('equipment_assignments').insert({
      asset_id:             assetId,
      site_id:              asset.site_id,
      tenant_id:            asset.tenant_id,
      assigned_to_profile:  assignedToProfileId || null,
      assigned_to_name:     assignedToName || null,
      zone:                 zone || null,
      assigned_by:          assignedBy,
    })

    // Update asset
    return useEquipmentAssetStore.getState().updateAsset(assetId, {
      status:                'in_use',
      current_assignee_id:   assignedToProfileId || null,
      current_assignee_name: assignedToName || null,
      current_zone:          zone || null,
    })
  },

  /**
   * Return an asset to available.
   */
  returnAsset: async (assetId, { returnCondition, note, returnedBy }) => {
    const now = new Date().toISOString()
    // Close open assignment
    await supabase.from('equipment_assignments')
      .update({ returned_at: now, return_condition: returnCondition || 'good', note: note || null })
      .eq('asset_id', assetId)
      .is('returned_at', null)

    return useEquipmentAssetStore.getState().updateAsset(assetId, {
      status:                'available',
      current_assignee_id:   null,
      current_assignee_name: null,
      current_zone:          null,
    })
  },

  /**
   * Send asset to maintenance.
   */
  sendToMaintenance: async (assetId, { serviceType, description, servicedBy, serviceDate, nextServiceDate, cost, createdBy }) => {
    const asset = (await supabase.from('equipment_assets').select('*').eq('id', assetId).single()).data
    if (!asset) throw new Error('Asset not found')

    await supabase.from('equipment_maintenance').insert({
      asset_id:         assetId,
      site_id:          asset.site_id,
      tenant_id:        asset.tenant_id,
      service_type:     serviceType,
      description:      description || null,
      cost:             cost || null,
      serviced_by:      servicedBy || null,
      service_date:     serviceDate,
      next_service_date: nextServiceDate || null,
      status:           'in_progress',
      created_by:       createdBy,
    })

    return useEquipmentAssetStore.getState().updateAsset(assetId, { status: 'maintenance' })
  },

  completeMaintenance: async (maintenanceId, assetId, { actualCost, nextServiceDate }) => {
    const now = new Date().toISOString()
    await supabase.from('equipment_maintenance')
      .update({ status: 'completed', completed_at: now, cost: actualCost || null, next_service_date: nextServiceDate || null })
      .eq('id', maintenanceId)

    return useEquipmentAssetStore.getState().updateAsset(assetId, {
      status:            'available',
      last_service_date: new Date().toISOString().slice(0, 10),
      next_service_date: nextServiceDate || null,
    })
  },

  retireAsset: async (assetId, { reason, retiredBy }) => {
    const asset = (await supabase.from('equipment_assets').select('*').eq('id', assetId).single()).data
    if (!asset) throw new Error('Asset not found')

    await useEquipmentAssetStore.getState().updateAsset(assetId, {
      status: 'retired',
      notes:  reason || null,
    })

    // Decrement material quantity_available by 1
    const { data: mat } = await supabase.from('materials').select('quantity_available').eq('id', asset.material_id).single()
    if (mat) {
      await supabase.from('materials')
        .update({ quantity_available: Math.max(0, (Number(mat.quantity_available) || 0) - 1) })
        .eq('id', asset.material_id)
    }
  },
}))

export default useEquipmentAssetStore
