<template>
  <div class="container mx-auto px-4 py-8">
    <!-- Header -->
    <div class="flex justify-between items-center mb-8">
      <h1 class="text-2xl font-bold">Orders Dashboard</h1>
      <button 
        @click="showAddOrderModal = true"
        class="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600"
      >
        Add New Order
      </button>
    </div>

    <!-- Filters -->
    <div class="bg-white p-4 rounded-lg shadow mb-8">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Doctor</label>
          <select 
            v-model="filters.doctorId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">All Doctors</option>
            <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
              {{ doctor.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Product</label>
          <select 
            v-model="filters.productId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">All Products</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Status</label>
          <select 
            v-model="filters.status"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="approved">Approved</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="outstanding">Outstanding</option>
          </select>
        </div>
        <div>
          <label class="block text-sm font-medium text-gray-700">Date Range</label>
          <div class="grid grid-cols-2 gap-2">
            <input 
              type="date" 
              v-model="filters.dateFrom"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
            <input 
              type="date" 
              v-model="filters.dateTo"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
          </div>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <table class="min-w-full divide-y divide-gray-200">
        <thead class="bg-gray-50">
          <tr>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Doctor
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Product
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Date of Service
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Status
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Amount
            </th>
            <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
              Actions
            </th>
          </tr>
        </thead>
        <tbody class="bg-white divide-y divide-gray-200">
          <tr v-for="order in filteredOrders" :key="order.id">
            <td class="px-6 py-4 whitespace-nowrap">
              {{ order.doctor?.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ order.product?.name }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ new Date(order.date_of_service).toLocaleDateString() }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              <span :class="getStatusClass(order.status)">
                {{ order.status }}
              </span>
            </td>
            <td class="px-6 py-4 whitespace-nowrap">
              {{ formatCurrency(order.invoice_to_doc) }}
            </td>
            <td class="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <button 
                @click="viewOrder(order)"
                class="text-blue-600 hover:text-blue-900 mr-4"
              >
                View
              </button>
              <button 
                @click="editOrder(order)"
                class="text-indigo-600 hover:text-indigo-900 mr-4"
              >
                Edit
              </button>
              <button 
                v-if="isAdmin && order.status === 'pending'"
                @click="approveOrder(order)"
                class="text-green-600 hover:text-green-900"
              >
                Approve
              </button>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <!-- Modals -->
    <AddOrderModal 
      v-if="showAddOrderModal"
      :doctors="doctors"
      :products="products"
      @close="showAddOrderModal = false"
      @order-added="handleOrderAdded"
    />

    <OrderDetailsModal
      v-if="selectedOrder"
      :order="selectedOrder"
      :is-admin="isAdmin"
      @close="selectedOrder = null"
      @order-updated="handleOrderUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { Order, Doctor, Product } from '@/types/models'
import { orderService } from '@/services/orderService'
import AddOrderModal from '@/components/orders/AddOrderModal.vue'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue'
import { formatCurrency } from '@/utils/formatters'

const supabase = useSupabase()

// State with proper typing
const orders = ref<Order[]>([])
const doctors = ref<Doctor[]>([])
const products = ref<Product[]>([])
const showAddOrderModal = ref(false)
const selectedOrder = ref<Order | null>(null)
const isAdmin = ref(false)

const filters = ref({
  doctorId: '',
  productId: '',
  status: '',
  dateFrom: '',
  dateTo: ''
})

// Computed with proper typing
const filteredOrders = computed(() => {
  return orders.value.filter((order: Order) => {
    if (filters.value.doctorId && order.doctor.id !== filters.value.doctorId) return false
    if (filters.value.productId && order.product.id !== filters.value.productId) return false
    if (filters.value.status && order.status !== filters.value.status) return false
    if (filters.value.dateFrom && new Date(order.date_of_service) < new Date(filters.value.dateFrom)) return false
    if (filters.value.dateTo && new Date(order.date_of_service) > new Date(filters.value.dateTo)) return false
    return true
  })
})

// Methods
const loadOrders = async () => {
  try {
    orders.value = await orderService.getOrders()
  } catch (error) {
    console.error('Error loading orders:', error)
  }
}

const loadDoctors = async () => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
  
  if (error) {
    console.error('Error loading doctors:', error)
    return
  }
  doctors.value = data || []
}

const loadProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
  
  if (error) {
    console.error('Error loading products:', error)
    return
  }
  products.value = data || []
}

const checkUserRole = async () => {
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const { data } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', user.id)
    .single()

  isAdmin.value = data?.role === 'admin'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const getStatusClass = (status: string): string => {
  const classes = {
    pending: 'bg-yellow-100 text-yellow-800',
    approved: 'bg-green-100 text-green-800',
    paid: 'bg-blue-100 text-blue-800',
    partial: 'bg-orange-100 text-orange-800',
    outstanding: 'bg-red-100 text-red-800'
  }
  return classes[status as keyof typeof classes] || 'bg-gray-100 text-gray-800'
}

const viewOrder = (order: Order) => {
  selectedOrder.value = order
}

const editOrder = (order: Order) => {
  selectedOrder.value = { ...order, isEditing: true }
}

const approveOrder = async (order: Order) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'approved',
      approved_by: user?.id,
      approved_at: new Date().toISOString()
    })
    .eq('id', order.id)

  if (error) {
    console.error('Error approving order:', error)
    return
  }

  await loadOrders()
}

const handleOrderAdded = async () => {
  showAddOrderModal.value = false
  await loadOrders()
}

const handleOrderUpdated = async () => {
  selectedOrder.value = null
  await loadOrders()
}

// Lifecycle
onMounted(async () => {
  try {
    await Promise.all([
      loadOrders(),
      loadDoctors(),
      loadProducts(),
      checkUserRole()
    ])
  } catch (error) {
    console.error('Failed to fetch dashboard data:', error)
  }
})
</script>

<style scoped>
.order-card {
  @apply bg-white p-4 rounded-lg shadow mb-4;
}

.actions button {
  @apply text-sm font-medium;
}
</style>
