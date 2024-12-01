import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import Layout from '../../components/common/ui/Layout.vue'
import OrderDetailsModal from '../../components/orders/OrderDetailsModal.vue'
import { dataService } from '../../services/data.service'
import type { Order } from '../../types/models'

export default {
  name: 'OrderList',
  components: {
    Layout,
    OrderDetailsModal
  },
  setup() {
    const router = useRouter()
    const loading = ref(true)
    const error = ref<string | null>(null)
    const orders = ref<Order[]>([])
    const selectedOrder = ref<Order | null>(null)
    const totalOrders = ref(0)

    // Pagination
    const currentPage = ref(1)
    const pageSize = 10

    // Filters and Sorting
    const filters = ref({
      status: '',
      dateRange: '30'
    })
    const sortBy = ref('date_of_service')
    const sortDesc = ref(true)

    // Computed
    const totalPages = computed(() => Math.ceil(totalOrders.value / pageSize))
    const startIndex = computed(() => (currentPage.value - 1) * pageSize)
    const endIndex = computed(() => Math.min(startIndex.value + pageSize, totalOrders.value))

    // Methods
    const formatCurrency = (value: number) => {
      return new Intl.NumberFormat('en-US').format(value)
    }

    const formatDate = (date: string) => {
      return new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    }

    const getStatusClass = (status: string) => {
      const classes = {
        paid: 'px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300',
        partial: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-900 text-yellow-300',
        outstanding: 'px-2 py-1 text-xs font-medium rounded-full bg-red-900 text-red-300'
      }
      return classes[status as keyof typeof classes] || ''
    }

    const loadOrders = async () => {
      try {
        loading.value = true
        error.value = null

        const { data, error: loadError, count } = await dataService.getOrders({
          page: currentPage.value,
          limit: pageSize,
          sortBy: sortBy.value,
          sortDesc: sortDesc.value,
          filters: {
            status: filters.value.status || undefined,
            date_range: filters.value.dateRange
          }
        })

        if (loadError) throw loadError

        orders.value = data || []
        totalOrders.value = count || 0
      } catch (err) {
        console.error('Error loading orders:', err)
        error.value = 'Failed to load orders'
      } finally {
        loading.value = false
      }
    }

    const openOrderDetails = (order: Order) => {
      selectedOrder.value = order
    }

    const prevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--
        loadOrders()
      }
    }

    const nextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++
        loadOrders()
      }
    }

    // Effect for filters
    const updateFilters = () => {
      currentPage.value = 1 // Reset to first page when filters change
      loadOrders()
    }

    // Watch-like effects using refs
    const handleFilterChange = () => {
      updateFilters()
    }

    // Initial load
    loadOrders()

    return {
      loading,
      error,
      orders,
      selectedOrder,
      totalOrders,
      currentPage,
      pageSize,
      filters,
      sortBy,
      sortDesc,
      totalPages,
      startIndex,
      endIndex,
      formatCurrency,
      formatDate,
      getStatusClass,
      openOrderDetails,
      prevPage,
      nextPage,
      handleFilterChange
    }
  }
}
