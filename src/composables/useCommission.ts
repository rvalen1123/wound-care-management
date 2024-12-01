import { ref } from 'vue'
import { useSupabase } from './useSupabase'

interface CommissionStructure {
  id?: string
  masterRepId: string
  subRepId?: string | null
  subSubRepId?: string | null
  masterRepRate: number
  subRepRate?: number | null
  subSubRepRate?: number | null
  createdBy?: string
  createdAt?: string
  updatedBy?: string
  updatedAt?: string
}

interface CommissionBreakdown {
  totalCommission: number
  masterRepCommission: number
  subRepCommission: number
  subSubRepCommission: number
}

export interface UseCommissionReturn {
  loading: Ref<boolean>
  error: Ref<string | null>
  createCommissionStructure: (structure: CommissionStructure) => Promise<any>
  updateCommissionStructure: (id: string, structure: Partial<CommissionStructure>) => Promise<any>
  getCommissionStructures: (masterRepId: string) => Promise<any[]>
  calculateCommissionBreakdown: (
    totalCommission: number,
    masterRepRate: number,
    subRepRate?: number | null,
    subSubRepRate?: number | null
  ) => CommissionBreakdown
  getCommissionAuditLog: (structureId: string) => Promise<any[]>
  applyCommissionStructureToOrder: (orderId: string, structureId: string) => Promise<any>
}

export function useCommission(): UseCommissionReturn {
  const supabase = useSupabase()
  const loading = ref(false)
  const error = ref<string | null>(null)

  /**
   * Create a new commission structure
   */
  const createCommissionStructure = async (structure: CommissionStructure) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('commission_structures')
        .insert({
          master_rep_id: structure.masterRepId,
          sub_rep_id: structure.subRepId,
          sub_sub_rep_id: structure.subSubRepId,
          master_rep_rate: structure.masterRepRate,
          sub_rep_rate: structure.subRepRate,
          sub_sub_rep_rate: structure.subSubRepRate,
          created_by: supabase.auth.user()?.id
        })
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Update an existing commission structure
   */
  const updateCommissionStructure = async (id: string, structure: Partial<CommissionStructure>) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('commission_structures')
        .update({
          master_rep_id: structure.masterRepId,
          sub_rep_id: structure.subRepId,
          sub_sub_rep_id: structure.subSubRepId,
          master_rep_rate: structure.masterRepRate,
          sub_rep_rate: structure.subRepRate,
          sub_sub_rep_rate: structure.subSubRepRate,
          updated_by: supabase.auth.user()?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single()

      if (err) throw err
      return data
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  /**
   * Get commission structures for a master rep
   */
  const getCommissionStructures = async (masterRepId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('commission_structures')
        .select(\`
          *,
          master_rep:master_rep_id(id, name),
          sub_rep:sub_rep_id(id, name),
          sub_sub_rep:sub_sub_rep_id(id, name)
        \`)
        .eq('master_rep_id', masterRepId)
        .order('created_at', { ascending: false })

      if (err) throw err
      return data
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Calculate commission breakdown for an order
   */
  const calculateCommissionBreakdown = (
    totalCommission: number,
    masterRepRate: number,
    subRepRate?: number | null,
    subSubRepRate?: number | null
  ): CommissionBreakdown => {
    const masterRepCommission = (totalCommission * masterRepRate) / 100
    const subRepCommission = subRepRate ? (totalCommission * subRepRate) / 100 : 0
    const subSubRepCommission = subSubRepRate ? (totalCommission * subSubRepRate) / 100 : 0

    return {
      totalCommission,
      masterRepCommission,
      subRepCommission,
      subSubRepCommission
    }
  }

  /**
   * Get commission structure audit log
   */
  const getCommissionAuditLog = async (structureId: string) => {
    loading.value = true
    error.value = null

    try {
      const { data, error: err } = await supabase
        .from('commission_structure_audit')
        .select(\`
          *,
          changed_by:changed_by(id, name)
        \`)
        .eq('commission_structure_id', structureId)
        .order('changed_at', { ascending: false })

      if (err) throw err
      return data
    } catch (err: any) {
      error.value = err.message
      return []
    } finally {
      loading.value = false
    }
  }

  /**
   * Apply commission structure to an order
   */
  const applyCommissionStructureToOrder = async (orderId: string, structureId: string) => {
    loading.value = true
    error.value = null

    try {
      // First get the commission structure
      const { data: structure, error: structureError } = await supabase
        .from('commission_structures')
        .select('*')
        .eq('id', structureId)
        .single()

      if (structureError) throw structureError

      // Then update the order with the structure's rates
      const { data, error: orderError } = await supabase
        .from('orders')
        .update({
          master_rep_id: structure.master_rep_id,
          sub_rep_id: structure.sub_rep_id,
          sub_sub_rep_id: structure.sub_sub_rep_id,
          master_rep_rate: structure.master_rep_rate,
          sub_rep_rate: structure.sub_rep_rate,
          sub_sub_rep_rate: structure.sub_sub_rep_rate,
          updated_by: supabase.auth.user()?.id,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId)
        .select()
        .single()

      if (orderError) throw orderError
      return data
    } catch (err: any) {
      error.value = err.message
      return null
    } finally {
      loading.value = false
    }
  }

  return {
    loading,
    error,
    createCommissionStructure,
    updateCommissionStructure,
    getCommissionStructures,
    calculateCommissionBreakdown,
    getCommissionAuditLog,
    applyCommissionStructureToOrder
  }
} 