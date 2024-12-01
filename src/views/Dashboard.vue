<template>
  <div class="dashboard">
    <!-- Header -->
    <header class="bg-white shadow">
      <div class="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <div class="flex justify-between items-center">
          <h1 class="text-3xl font-bold text-gray-900">Dashboard</h1>
          <button
            @click="showAddOrderModal = true"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700"
          >
            Add New Order
          </button>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
      <!-- Filters -->
      <div class="bg-white p-4 rounded-lg shadow mb-6">
        <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Doctor</label>
            <select v-model="filters.doctorId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">All Doctors</option>
              <option v-for="doctor in doctors" :key="doctor.doctor_id" :value="doctor.doctor_id">
                {{ doctor.doctor_name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Product</label>
            <select v-model="filters.productId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">All Products</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.Product }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Status</label>
            <select v-model="filters.status" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
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
      <div class="bg-white shadow rounded-lg overflow-hidden">
        <div class="overflow-x-auto">
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
                  Invoice Amount
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Commission
                </th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-white divide-y divide-gray-200">
              <tr v-for="order in filteredOrders" :key="order.order_id">
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ getDoctorName(order.doctor_id) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ getProductName(order.product_id) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  {{ formatDate(order.date_of_service) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="getStatusClass(order.status)" class="px-2 inline-flex text-xs leading-5 font-semibold rounded-full">
                    {{ order.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${{ formatCurrency(order.invoice_amount_billed) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  ${{ formatCurrency(order.msc_commission) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <button
                    @click="viewOrder(order)"
                    class="text-blue-600 hover:text-blue-900 mr-2"
                  >
                    View
                  </button>
                  <button
                    v-if="isAdmin && order.status === 'pending'"
                    @click="approveOrder(order)"
                    class="text-green-600 hover:text-green-900 mr-2"
                  >
                    Approve
                  </button>
                  <button
                    @click="editOrder(order)"
                    class="text-indigo-600 hover:text-indigo-900"
                  >
                    Edit
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </main>

    <!-- Add Order Modal -->
    <AddOrderModal
      v-if="showAddOrderModal"
      @close="showAddOrderModal = false"
      @order-added="handleOrderAdded"
    />

    <!-- View/Edit Order Modal -->
    <OrderDetailsModal
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="selectedOrder = null"
      @order-updated="handleOrderUpdated"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import AddOrderModal from '@/components/orders/AddOrderModal.vue'
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue'

const supabase = useSupabase()

// State
const orders = ref([])
const doctors = ref([])
const products = ref([])
const showAddOrderModal = ref(false)
const selectedOrder = ref(null)
const isAdmin = ref(false)

const filters = ref({
  doctorId: '',
  productId: '',
  status: '',
  dateFrom: '',
  dateTo: ''
})

// Computed
const filteredOrders = computed(() => {
  return orders.value.filter(order => {
    if (filters.value.doctorId && order.doctor_id !== filters.value.doctorId) return false
    if (filters.value.productId && order.product_id !== filters.value.productId) return false
    if (filters.value.status && order.status !== filters.value.status) return false
    if (filters.value.dateFrom && new Date(order.date_of_service) < new Date(filters.value.dateFrom)) return false
    if (filters.value.dateTo && new Date(order.date_of_service) > new Date(filters.value.dateTo)) return false
    return true
  })
})

// Methods
const loadOrders = async () => {
  const { data, error } = await supabase
    .from('orders')
    .select(\`
      *,
      doctor:doctor_id(doctor_name),
      product:product_id(Product),
      master_rep:master_rep_id(rep_name),
      sub_rep:sub_rep_id(rep_name),
      sub_sub_rep:sub_sub_rep_id(rep_name)
    \`)
    .order('date_of_service', { ascending: false })

  if (error) {
    console.error('Error loading orders:', error)
    return
  }

  orders.value = data
}

const loadDoctors = async () => {
  const { data, error } = await supabase
    .from('doctors')
    .select('doctor_id, doctor_name')
    .order('doctor_name')

  if (error) {
    console.error('Error loading doctors:', error)
    return
  }

  doctors.value = data
}

const loadProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('id, Product')
    .order('Product')

  if (error) {
    console.error('Error loading products:', error)
    return
  }

  products.value = data
}

const checkUserRole = async () => {
  const user = supabase.auth.user()
  if (user?.user_metadata?.role === 'admin') {
    isAdmin.value = true
  }
}

const getDoctorName = (doctorId: string) => {
  const doctor = doctors.value.find(d => d.doctor_id === doctorId)
  return doctor?.doctor_name || 'Unknown'
}

const getProductName = (productId: string) => {
  const product = products.value.find(p => p.id === productId)
  return product?.Product || 'Unknown'
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

const formatCurrency = (amount: number) => {
  return amount.toFixed(2)
}

const getStatusClass = (status: string) => {
  return {
    'bg-yellow-100 text-yellow-800': status === 'pending',
    'bg-green-100 text-green-800': status === 'paid',
    'bg-blue-100 text-blue-800': status === 'approved',
    'bg-orange-100 text-orange-800': status === 'partial',
    'bg-red-100 text-red-800': status === 'outstanding'
  }[status] || 'bg-gray-100 text-gray-800'
}

const viewOrder = (order: any) => {
  selectedOrder.value = order
}

const editOrder = (order: any) => {
  selectedOrder.value = { ...order, isEditing: true }
}

const approveOrder = async (order: any) => {
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'approved',
      approved_by: supabase.auth.user()?.id,
      approved_at: new Date().toISOString()
    })
    .eq('order_id', order.order_id)

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
  await Promise.all([
    loadOrders(),
    loadDoctors(),
    loadProducts(),
    checkUserRole()
  ])
})
</script>
