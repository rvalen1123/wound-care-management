import { ref, onMounted } from 'vue'
import Layout from '../components/common/ui/Layout.vue'
import { dataService } from '../services/data.service'
import type { Order, Representative, Analytics, DashboardMetrics } from '../types/models'

export default {
  name: 'Dashboard',
  components: {
    Layout
  },
  setup() {
    const loading = ref(true)
    const error = ref<string | null>(null)

    const metrics = ref<DashboardMetrics>({
      owedByDoctors: 0,
      owedToManufacturers: 0,
      owedInCommissions: 0,
      totalDoctors: 0,
      totalProducts: 0,
      totalReps: 0
    })

    const recentOrders = ref<Order[]>([])
    const salesReps = ref<Representative[]>([])
    const analytics = ref<Analytics>({
      totalSales: 0,
      totalCommissions: 0,
      topReps: []
    })

    // Format currency
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US').format(value)
    }

    // Format date
    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    // Get initials from name
    const getInitials = (name: string) => {
      return name
        .split(' ')
        .map(word => word[0])
        .join('')
        .toUpperCase()
    }

    // Get status class
    const getStatusClass = (status: string) => {
      const classes = {
        paid: 'px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300',
        partial: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-900 text-yellow-300',
        outstanding: 'px-2 py-1 text-xs font-medium rounded-full bg-red-900 text-red-300'
      }
      return classes[status as keyof typeof classes] || ''
    }

    // Load dashboard data
    const loadDashboardData = async () => {
      try {
        loading.value = true
        error.value = null

        // Load orders
        const { data: ordersData, error: ordersError } = await dataService.getOrders({
          limit: 5,
          sortBy: 'created_at',
          sortDesc: true
        })

        if (ordersError) throw ordersError
        recentOrders.value = ordersData || []

        // Load reps
        const { data: repsData, error: repsError } = await dataService.getReps({
          limit: 5,
          sortBy: 'totalSales',
          sortDesc: true
        })

        if (repsError) throw repsError
        salesReps.value = repsData || []

        // Load analytics
        const { data: analyticsData, error: analyticsError } = await dataService.getAnalytics('month')

        if (analyticsError) throw analyticsError
        analytics.value = analyticsData || { totalSales: 0, totalCommissions: 0, topReps: [] }

        // Calculate metrics
        metrics.value = {
          owedByDoctors: recentOrders.value.reduce((sum: number, order: Order) => {
            return sum + (order.status === 'outstanding' ? order.invoice_to_doc : 0)
          }, 0),
          owedToManufacturers: recentOrders.value.reduce((sum: number, order: Order) => {
            return sum + (order.status === 'outstanding' ? order.invoice_to_doc * 0.4 : 0)
          }, 0),
          owedInCommissions: analytics.value.totalCommissions,
          totalDoctors: new Set(recentOrders.value.map((order: Order) => order.doctor_id)).size,
          totalProducts: new Set(recentOrders.value.map((order: Order) => order.product_id)).size,
          totalReps: salesReps.value.length
        }

      } catch (err) {
        console.error('Error loading dashboard data:', err)
        error.value = 'Failed to load dashboard data'
      } finally {
        loading.value = false
      }
    }

    onMounted(() => {
      loadDashboardData()
    })

    return {
      loading,
      error,
      metrics,
      recentOrders,
      salesReps,
      analytics,
      formatCurrency,
      formatDate,
      getInitials,
      getStatusClass
    }
  }
}
