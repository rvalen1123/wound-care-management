<template>
  <div>
    <div v-if="orders.length">
      <div v-for="order in filteredOrders" :key="order.order_id">
        <!-- Add actual order display content -->
        <div class="order-card">
          <h3>Order #{{ order.order_id }}</h3>
          <p>Doctor: {{ getDoctorName(order.doctor_id) }}</p>
          <p>Product: {{ getProductName(order.product_id) }}</p>
          <p>Status: <span :class="getStatusClass(order.status)">{{ order.status }}</span></p>
          <p>Date: {{ formatDate(order.date_of_service) }}</p>
          <p>Amount: ${{ formatCurrency(order.invoice_amount_billed) }}</p>
          
          <div class="actions">
            <button @click="viewOrder(order)">View Details</button>
            <button @click="editOrder(order)">Edit</button>
            <button 
              v-if="isAdmin && order.status !== 'approved'" 
              @click="approveOrder(order)"
            >
              Approve
            </button>
          </div>
        </div>
      </div>
    </div>
    <div v-else>
      Loading...
    </div>

    <!-- Add Modal Components -->
    <AddOrderModal 
      v-if="showAddOrderModal"
      @close="showAddOrderModal = false"
      @order-added="handleOrderAdded"
    />

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
import type { User } from '@supabase/supabase-js'

// Define interfaces for type safety
interface Order {
  order_id: string
  doctor_id: string
  product_id: string
  status: string
  date_of_service: string
  invoice_amount_billed: number
  msc_commission: number
}

interface Doctor {
  doctor_id: string
  doctor_name: string
}

interface Product {
  id: string
  Product: string
}

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
    .select(`
      *,
      doctor:doctor_id(doctor_name),
      product:product_id(Product),
      master_rep:master_rep_id(rep_name),
      sub_rep:sub_rep_id(rep_name),
      sub_sub_rep:sub_sub_rep_id(rep_name)
    `)
    .order('date_of_service', { ascending: false })

  if (error) {
    console.error('Error loading orders:', error)
    return
  }

  orders.value = data || []
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
  const { data: { user } } = await supabase.auth.getUser()
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

const approveOrder = async (order: Order) => {
  const { data: { user } } = await supabase.auth.getUser()
  const { error } = await supabase
    .from('orders')
    .update({
      status: 'approved',
      approved_by: user?.id,
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
