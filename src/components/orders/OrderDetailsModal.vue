<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-3xl">
      <div class="p-6">
        <div class="flex justify-between items-center mb-6">
          <h2 class="text-xl font-semibold">
            {{ order.isEditing ? 'Edit Order' : 'Order Details' }}
          </h2>
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
              <label class="block text-sm font-medium text-gray-700">Expected Collection</label>
              <div class="mt-1">
                {{ formatDate(order.expected_collection_date) }}
              </div>
            </div>
          </div>

          <!-- Financial Information -->
          <div class="bg-gray-50 p-4 rounded-lg space-y-4">
            <div class="grid grid-cols-2 gap-6">
              <div>
                <label class="block text-sm font-medium text-gray-700">Invoice Amount</label>
                <div class="mt-1" v-if="!order.isEditing">
                  {{ formatCurrency(order.invoice_to_doc) }}
                </div>
                <input
                  v-else
                  type="number"
                  v-model="editForm.invoice_to_doc"
                  step="0.01"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
              </div>

              <div>
                <label class="block text-sm font-medium text-gray-700">MSC Commission</label>
                <div class="mt-1" v-if="!order.isEditing">
                  {{ formatCurrency(order.msc_commission) }}
                </div>
                <input
                  v-else
                  type="number"
                  v-model="editForm.msc_commission"
                  step="0.01"
                  class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                >
              </div>
            </div>

            <!-- Payment Tracking -->
            <div v-if="payment" class="mt-4">
              <h3 class="text-lg font-medium text-gray-900 mb-3">Payment Status</h3>
              <div class="grid grid-cols-2 gap-6">
                <div>
                  <label class="block text-sm font-medium text-gray-700">Manufacturer Paid</label>
                  <div class="mt-1">
                    {{ formatCurrency(payment.manufacturer_paid) }}
                  </div>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-700">Remaining Balance</label>
                  <div class="mt-1">
                    {{ formatCurrency(payment.remaining_balance) }}
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Commission Breakdown -->
          <div v-if="commissions.length" class="space-y-4">
            <h3 class="text-lg font-medium text-gray-900">Commission Breakdown</h3>
            <div class="space-y-3">
              <div v-for="commission in commissions" :key="commission.id" class="flex justify-between items-center">
                <div>
                  <span class="font-medium">{{ commission.rep?.name }}</span>
                  <span class="text-sm text-gray-500">({{ commission.rep?.role }})</span>
                </div>
                <div>
                  {{ formatCurrency(commission.commission_amount) }}
                </div>
              </div>
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-4 pt-4 border-t">
            <button 
              v-if="!order.isEditing"
              type="button"
              @click="startEditing"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
            >
              Edit Order
            </button>
            <template v-else>
              <button 
                type="button"
                @click="cancelEditing"
                class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
              >
                Cancel
              </button>
              <button 
                type="button"
                @click="saveChanges"
                class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700"
              >
                Save Changes
              </button>
            </template>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { Order, Payment, Commission } from '@/types/models'
import { orderService } from '@/services/orderService'
import { supabase } from '@/lib/supabaseClient'

const props = defineProps<{
  order: Order
  isAdmin: boolean
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'order-updated'): void
}>()

const payment = ref<Payment | null>(null)
const commissions = ref<Commission[]>([])
const editForm = ref({
  invoice_to_doc: props.order.invoice_to_doc,
  msc_commission: props.order.msc_commission
})

const loadPayment = async () => {
  const { data, error } = await supabase
    .from('payments')
    .select('*')
    .eq('order_id', props.order.id)
    .single()

  if (error) {
    console.error('Error loading payment:', error)
    return
  }

  payment.value = data
}

const loadCommissions = async () => {
  const { data, error } = await supabase
    .from('commissions')
    .select('*, rep(*)')
    .eq('order_id', props.order.id)

  if (error) {
    console.error('Error loading commissions:', error)
    return
  }

  commissions.value = data
}

const startEditing = () => {
  editForm.value = {
    invoice_to_doc: props.order.invoice_to_doc,
    msc_commission: props.order.msc_commission
  }
}

const cancelEditing = () => {
  emit('order-updated')
}

const saveChanges = async () => {
  try {
    const { error } = await orderService.updateOrder(props.order.id, {
      invoice_to_doc: editForm.value.invoice_to_doc,
      msc_commission: editForm.value.msc_commission
    })

    if (error) {
      console.error('Error updating order:', error)
      return
    }

    emit('order-updated')
  } catch (error) {
    console.error('Error saving changes:', error)
  }
}

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount)
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString()
}

onMounted(async () => {
  await Promise.all([
    loadPayment(),
    loadCommissions()
  ])
})
</script>