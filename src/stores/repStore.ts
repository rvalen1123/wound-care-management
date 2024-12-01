import { defineStore } from 'pinia'
import { ref, computed } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { 
  RepProfile, 
  RepCommissionAgreement, 
  Order 
} from '@/types/models'
import { useAuthStore } from '@/stores/auth'

interface CommissionHistory {
  period: string
  orders: number
  base_commission: number
  effective_commission: number
  sub_rep_share: number
}

export const useRepStore = defineStore('rep', () => {
  const authStore = useAuthStore()
  
  // State
  const reps = ref<RepProfile[]>([])
  const commissionAgreements = ref<RepCommissionAgreement[]>([])
  const loading = ref(false)
  const error = ref<string | null>(null)
  const ytdCommission = ref(0)
  const lastYearCommission = ref(0)
  const monthlyOrders = ref(0)
  const monthlyCommission = ref(0)
  const commissionHistory = ref<CommissionHistory[]>([])
  const recentOrders = ref<Order[]>([])

  // Getters
  const getRepById = computed(() => {
    return (id: string) => reps.value.find(rep => rep.id === id)
  })

  // Actions
  async function fetchReps() {
    try {
      loading.value = true
      const { data, error: err } = await supabase
        .from<RepProfile>('representatives')
        .select('*')
        .order('name')

      if (err) throw err
      if (!data) throw new Error('No data returned from representatives')

      reps.value = data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch reps'
      console.error('Error fetching reps:', errorMessage)
      error.value = errorMessage
    } finally {
      loading.value = false
    }
  }

  async function getCurrentRepProfile(): Promise<RepProfile | null> {
    try {
      const userId = authStore.user?.id
      if (!userId) return null
      
      const { data: profile, error: err } = await supabase
        .from<RepProfile>('representatives')
        .select('*')
        .eq('user_id', userId)
        .single()

      if (err) throw err
      return profile
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch rep profile'
      console.error('Error fetching rep profile:', errorMessage)
      error.value = errorMessage
      return null
    }
  }

  async function fetchRepCommissions(): Promise<void> {
    try {
      const currentRep = await getCurrentRepProfile()
      if (!currentRep) {
        error.value = 'No rep profile found'
        return
      }

      const { data: commissions, error: err } = await supabase
        .from('commission_history')
        .select('*')
        .eq('rep_id', currentRep.id)
        .order('period', { ascending: false })

      if (err) throw err
      if (!commissions) throw new Error('No commission data returned')

      commissionHistory.value = commissions.map(c => ({
        period: c.period,
        orders: c.orders,
        base_commission: c.base_commission,
        effective_commission: c.effective_commission,
        sub_rep_share: c.sub_rep_share
      }))
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch commissions'
      console.error('Error fetching commissions:', errorMessage)
      error.value = errorMessage
    }
  }

  async function fetchRecentOrders() {
    try {
      const currentRep = await getCurrentRepProfile()
      if (!currentRep) {
        error.value = 'No rep profile found'
        return
      }

      const { data: orders, error: err } = await supabase
        .from('orders')
        .select(`
          *,
          doctor:doctor_id(*),
          product:product_id(*)
        `)
        .eq('rep_id', currentRep.id)
        .order('date_of_service', { ascending: false })
        .limit(10)

      if (err) throw err
      if (!orders) throw new Error('No orders data returned')

      recentOrders.value = orders
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to fetch recent orders'
      console.error('Error fetching recent orders:', errorMessage)
      error.value = errorMessage
    }
  }

  async function generateCommissionReport(): Promise<CommissionHistory[]> {
    await fetchRepCommissions()
    return commissionHistory.value
  }

  return {
    // State
    reps,
    commissionAgreements,
    loading,
    error,
    ytdCommission,
    lastYearCommission,
    monthlyOrders,
    monthlyCommission,
    recentOrders,

    // Getters
    getRepById,
    getYTDCommission: () => ytdCommission.value,
    getLastYearCommission: () => lastYearCommission.value,
    getCurrentMonthOrders: () => monthlyOrders.value,
    getCurrentMonthCommission: () => monthlyCommission.value,
    getRecentOrders: () => recentOrders.value,
    getCommissionBreakdown: () => commissionHistory.value,

    // Actions
    fetchReps,
    fetchRepCommissions,
    fetchRecentOrders,
    getCurrentRepProfile,
    generateCommissionReport
  }
})
