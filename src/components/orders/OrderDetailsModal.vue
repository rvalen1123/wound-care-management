<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">
            {{ order.isEditing ? 'Edit Order' : 'Quick View Order Details' }}
          </h2>
          <div class="flex gap-2">
            <router-link 
              :to="{ name: 'OrderDetails', params: { id: order.id }}" 
              class="text-indigo-600 hover:text-indigo-800"
            >
              View Full Details
            </router-link>
            <button 
              @click="$emit('close')"
              class="text-gray-400 hover:text-gray-500"
            >
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        <div class="space-y-6">
          <!-- Order Information -->
          <div class="grid grid-cols-2 gap-6">
            <div>
              <label class="block text-sm font-medium text-gray-700">Doctor</label>
              <div class="mt-1">
                {{ order.doctor?.name }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Product</label>
              <div class="mt-1">
                {{ order.product?.name }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Date of Service</label>
              <div class="mt-1">
                {{ formatDate(order.date_of_service) }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Size</label>
              <div class="mt-1">
                {{ order.size }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Units</label>
              <div class="mt-1">
                {{ order.units }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Invoice Amount</label>
              <div class="mt-1">
                {{ formatCurrency(order.invoice_to_doc) }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Expected Collection</label>
              <div class="mt-1">
                {{ formatDate(order.expected_collection_date) }}
              </div>
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Status</label>
              <div class="mt-1">
                <span 
                  :class="{
                    'px-2 py-1 text-sm rounded-full': true,
                    'bg-yellow-100 text-yellow-800': order.status === 'pending',
                    'bg-green-100 text-green-800': order.status === 'approved',
                    'bg-red-100 text-red-800': order.status === 'rejected'
                  }"
                >
                  {{ order.status.charAt(0).toUpperCase() + order.status.slice(1) }}
                </span>
              </div>
            </div>
          </div>

          <!-- Quick Summary -->
          <div class="mt-6 pt-6 border-t border-gray-200">
            <h3 class="text-lg font-medium text-gray-900">Quick Summary</h3>
            <dl class="mt-3 grid grid-cols-1 gap-5 sm:grid-cols-2">
              <div class="px-4 py-3 bg-gray-50 rounded-lg">
                <dt class="text-sm font-medium text-gray-500">MSC Commission</dt>
                <dd class="mt-1 text-lg font-semibold text-gray-900">
                  {{ formatCurrency(order.msc_commission) }}
                </dd>
              </div>
              <div class="px-4 py-3 bg-gray-50 rounded-lg">
                <dt class="text-sm font-medium text-gray-500">Payment Status</dt>
                <dd class="mt-1 text-lg font-semibold text-gray-900">
                  {{ payment ? 'Paid' : 'Pending' }}
                </dd>
              </div>
            </dl>
          </div>

          <!-- Action Buttons -->
          <div class="flex justify-end space-x-4 pt-4 border-t">
            <button 
              v-if="!order.isEditing"
              type="button"
              @click="startEditing"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Edit
            </button>
            <button
              v-if="order.isEditing"
              type="button"
              @click="cancelEditing"
              class="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Cancel
            </button>
            <button
              v-if="order.isEditing"
              type="button"
              @click="saveChanges"
              class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { supabase } from '@/lib/supabaseClient'
import type { Order, Payment, Commission } from '@/types/models'
import { orderService } from '@/services/orderService'

const props = defineProps<{
  order: Order
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'update', order: Order): void
}>()

const payment = ref<Payment | null>(null)
const commissions = ref<Commission[]>([])

const loadPayment = async () => {
  try {
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .eq('order_id', props.order.id)
      .single();

    if (error) {
      console.error('Error loading payment:', error.message);
      return null;
    }
    
    payment.value = data;
    return data;
  } catch (error) {
    console.error('Error loading payment:', error);
    return null;
  }
}

const loadCommissions = async () => {
  try {
    const { data, error } = await supabase
      .from('commissions')
      .select('*')
      .eq('order_id', props.order.id);

    if (error) {
      console.error('Error loading commissions:', error.message);
      return [];
    }
    
    commissions.value = data;
    return data;
  } catch (error) {
    console.error('Error loading commissions:', error);
    return [];
  }
}

const startEditing = () => {
  emit('update', { ...props.order, isEditing: true })
}

const cancelEditing = () => {
  emit('update', { ...props.order, isEditing: false })
}

const saveChanges = async () => {
  try {
    const updatedOrder = await orderService.updateOrder(props.order.id, props.order)
    emit('update', { ...updatedOrder, isEditing: false })
  } catch (error) {
    console.error('Error saving changes:', error)
    // TODO: Add error notification
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  })
}

onMounted(async () => {
  await Promise.all([
    loadPayment(),
    loadCommissions()
  ])
})
</script>