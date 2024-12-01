import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import type { 
  Order, 
  OrderFilters, 
  OrderCalculations, 
  CommissionStructure, 
  OrderCommission, 
  RepCommission, 
  PartialOrderCalculations
} from '@/types/models'
import { supabase } from '@/lib/supabaseClient'
import { useAuthStore } from '@/stores/auth'
import { useRepStore } from '@/stores/repStore'

export const useOrderStore = defineStore('orders', () => {
  // State
  const orders = ref<Order[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const currentOrder = ref<Order | null>(null)
  const defaultCommissionStructures = ref<Map<string, CommissionStructure>>(new Map())
  const orderCommissions = ref<Map<number, OrderCommission>>(new Map())

  // Getters
  const getOrderById = computed(() => {
    return (id: number) => orders.value.find(order => order.id === id)
  })

  const filteredOrders = computed(() => {
    return (filters: OrderFilters) => {
      return orders.value.filter(order => {
        if (filters.doctorId && order.doctor_id !== parseInt(filters.doctorId)) return false
        if (filters.productId && order.product_id !== parseInt(filters.productId)) return false
        if (filters.status && order.status !== filters.status) return false
        if (filters.dateFrom && new Date(order.date_of_service) < new Date(filters.dateFrom)) return false
        if (filters.dateTo && new Date(order.date_of_service) > new Date(filters.dateTo)) return false
        return true
      })
    }
  })

  // Actions
  async function fetchOrders() {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from<Order, any>('orders')
        .select(`
          *,
          doctor:doctor_id(*),
          product:product_id(*)
        `)
        .order('created_at', { ascending: false })

      if (err) throw err
      if (!data) throw new Error('No orders data returned')

      orders.value = data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch orders'
      console.error('Error fetching orders:', errorMessage)
      error.value = errorMessage
    } finally {
      loading.value = false
    }
  }

  async function createOrder(orderData: Partial<Order>) {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from<Order, any>('orders')
        .insert([orderData])
        .select()
        .single()

      if (err) throw err
      if (!data) throw new Error('No order data returned after creation')

      orders.value.unshift(data)
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to create order'
      console.error('Error creating order:', errorMessage)
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  async function updateOrder(id: number, updates: Partial<Order>) {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from<Order, any>('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single()

      if (err) throw err
      if (!data) throw new Error('No order data returned after update')

      const index = orders.value.findIndex(order => order.id === id)
      if (index !== -1) {
        orders.value[index] = { ...orders.value[index], ...data }
      }
      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update order'
      console.error('Error updating order:', errorMessage)
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  async function deleteOrder(id: number) {
    try {
      loading.value = true
      const { error: err } = await supabase
        .from('orders')
        .delete()
        .eq('id', id)

      if (err) throw err

      orders.value = orders.value.filter(order => order.id !== id)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to delete order'
      console.error('Error deleting order:', errorMessage)
      error.value = errorMessage
      throw err
    } finally {
      loading.value = false
    }
  }

  async function fetchDefaultCommissionStructure(masterRepId: string): Promise<CommissionStructure | null> {
    try {
      const { data, error } = await supabase
        .from<CommissionStructure, any>('commission_structures')
        .select('*')
        .eq('master_rep_id', masterRepId)
        .eq('is_default', true)
        .single()

      if (error) throw error

      if (data) {
        defaultCommissionStructures.value.set(masterRepId, data)
        return data
      }

      return null
    } catch (error) {
      console.error('Error fetching default commission structure:', error)
      return null
    }
  }

  async function updateCommissionStructure(
    orderId: number,
    commissionData: {
      masterRepPercentage: number
      subRepPercentage?: number
      subSubRepPercentage?: number
      masterRepId: string
      subRepId?: string
      subSubRepId?: string
    }
  ): Promise<boolean> {
    const authStore = useAuthStore()
    if (!authStore.isAdmin) {
      error.value = 'Only administrators can modify commission structures'
      return false
    }

    try {
      const order = orders.value.find(o => o.id === orderId)
      if (!order) throw new Error('Order not found')

      const totalCommission = order.msc_commission
      const timestamp = new Date().toISOString()
      const userId = authStore.user?.id
      if (!userId) throw new Error('User not authenticated')

      // Calculate commission amounts
      const masterCommission: RepCommission = {
        rep_id: commissionData.masterRepId,
        rep_name: 'Master Rep',
        rep_type: 'master',
        percentage: commissionData.masterRepPercentage,
        amount: totalCommission * (commissionData.masterRepPercentage / 100),
        default_percentage: 50
      }

      let subCommission: RepCommission | undefined
      let subSubCommission: RepCommission | undefined

      if (commissionData.subRepId && commissionData.subRepPercentage) {
        subCommission = {
          rep_id: commissionData.subRepId,
          rep_name: 'Sub Rep',
          rep_type: 'sub',
          percentage: commissionData.subRepPercentage,
          amount: totalCommission * (commissionData.subRepPercentage / 100),
          default_percentage: 30
        }
      }

      if (commissionData.subSubRepId && commissionData.subSubRepPercentage) {
        subSubCommission = {
          rep_id: commissionData.subSubRepId,
          rep_name: 'Sub-Sub Rep',
          rep_type: 'sub-sub',
          percentage: commissionData.subSubRepPercentage,
          amount: totalCommission * (commissionData.subSubRepPercentage / 100),
          default_percentage: 20
        }
      }

      // Create commission structure in database
      const { data: structureData, error: structureError } = await supabase
        .from<CommissionStructure, any>('commission_structures')
        .insert({
          master_rep_id: commissionData.masterRepId,
          sub_rep_id: commissionData.subRepId,
          sub_sub_rep_id: commissionData.subSubRepId,
          master_rep_percentage: commissionData.masterRepPercentage,
          sub_rep_percentage: commissionData.subRepPercentage,
          sub_sub_rep_percentage: commissionData.subSubRepPercentage,
          is_default: false,
          created_by: userId,
          created_at: timestamp
        })
        .select()
        .single()

      if (structureError) throw structureError
      if (!structureData) throw new Error('Failed to create commission structure')

      // Update order commission
      const orderCommission: OrderCommission = {
        total_commission: totalCommission,
        commission_structure_id: structureData.id,
        master_rep_commission: masterCommission,
        sub_rep_commission: subCommission,
        sub_sub_rep_commission: subSubCommission,
        last_modified_by: userId,
        last_modified_at: timestamp
      }

      // Update local state
      orderCommissions.value.set(orderId, orderCommission)

      // Update order in database
      const { error: orderError } = await supabase
        .from<Order, any>('orders')
        .update({
          commission_structure_id: structureData.id,
          updated_at: timestamp,
          updated_by: userId
        })
        .eq('id', orderId)

      if (orderError) throw orderError

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to update commission structure'
      console.error('Error updating commission structure:', errorMessage)
      error.value = errorMessage
      return false
    }
  }

  async function getOrderCommission(orderId: number): Promise<OrderCommission | null> {
    // First check local state
    if (orderCommissions.value.has(orderId)) {
      return orderCommissions.value.get(orderId) || null
    }

    try {
      const { data: order, error: orderError } = await supabase
        .from<Order, any>('orders')
        .select(`
          *,
          commission_structure:commission_structures(*)
        `)
        .eq('id', orderId)
        .single()

      if (orderError) throw orderError
      if (!order) return null

      // Calculate commission breakdown based on structure
      const structure = order.commission_structure
      const totalCommission = order.msc_commission

      const orderCommission: OrderCommission = {
        total_commission: totalCommission,
        commission_structure_id: structure?.id,
        master_rep_commission: {
          rep_id: structure.master_rep_id,
          rep_name: 'Master Rep',
          rep_type: 'master',
          percentage: structure.master_rep_percentage,
          amount: totalCommission * (structure.master_rep_percentage / 100),
          default_percentage: 50
        }
      }

      if (structure.sub_rep_id) {
        orderCommission.sub_rep_commission = {
          rep_id: structure.sub_rep_id,
          rep_name: 'Sub Rep',
          rep_type: 'sub',
          percentage: structure.sub_rep_percentage,
          amount: totalCommission * (structure.sub_rep_percentage / 100),
          default_percentage: 30
        }
      }

      if (structure.sub_sub_rep_id) {
        orderCommission.sub_sub_rep_commission = {
          rep_id: structure.sub_sub_rep_id,
          rep_name: 'Sub-Sub Rep',
          rep_type: 'sub-sub',
          percentage: structure.sub_sub_rep_percentage,
          amount: totalCommission * (structure.sub_sub_rep_percentage / 100),
          default_percentage: 20
        }
      }

      // Cache in local state
      orderCommissions.value.set(orderId, orderCommission)
      return orderCommission
    } catch (error) {
      console.error('Error fetching order commission:', error)
      return null
    }
  }

  async function calculateOrderCommission(orderId: number): Promise<OrderCalculations | null> {
    try {
      const order = orders.value.find(o => o.id === orderId)
      if (!order) throw new Error('Order not found')

      const repStore = useRepStore()
      
      // Calculate commission breakdown
      const commissionBreakdown = await repStore.calculateOrderCommissions(
        orderId,
        order.msc_commission,
        order.master_rep_id
      )

      if (!commissionBreakdown) throw new Error('Failed to calculate commissions')

      // Save commission breakdown to database
      const { error: saveError } = await supabase
        .from<OrderCalculations>('order_commission_breakdowns')
        .upsert({
          ...commissionBreakdown,
          updated_at: new Date().toISOString(),
          updated_by: useAuthStore().user?.id
        })

      if (saveError) throw saveError

      return commissionBreakdown
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to calculate order commission'
      console.error('Error calculating order commission:', errorMessage)
      error.value = errorMessage
      return null
    }
  }

  async function calculateOrderCommissions(order: Order): Promise<OrderCalculations> {
    const repStore = useRepStore()
    const repProfile = await repStore.getCurrentRepProfile()
    
    if (!repProfile) {
      throw new Error('No rep profile found')
    }

    if (!order.product) {
      throw new Error('Order must have a product')
    }

    const data: PartialOrderCalculations = {
      product: order.product,
      repId: repProfile.id,
      units: order.units,
      invoiceAmount: order.invoice_to_doc,
      expectedCollectionDate: order.expected_collection_date,
      mscCommission: order.msc_commission
    }

    return calculateOrderValues(data)
  }

  function calculateOrderValues(data: PartialOrderCalculations): OrderCalculations {
    if (!data.product) {
      throw new Error('Product is required for calculations')
    }

    if (!data.repId) {
      throw new Error('Rep ID is required for calculations')
    }

    return {
      units: data.units || 0,
      invoiceAmount: data.invoiceAmount || 0,
      expectedCollectionDate: data.expectedCollectionDate || new Date().toISOString(),
      mscCommission: data.mscCommission || 0,
      product: data.product,
      repId: data.repId,
      repCommissions: [],
      amount: 0
    }
  }

  return {
    // State
    orders,
    loading,
    error,
    currentOrder,
    defaultCommissionStructures,
    orderCommissions,

    // Actions
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    fetchDefaultCommissionStructure,
    updateCommissionStructure,
    getOrderCommission,
    calculateOrderCommission,
    calculateOrderCommissions,
    calculateOrderValues
  }
})
