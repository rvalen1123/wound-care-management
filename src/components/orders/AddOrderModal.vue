<template>
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4">
    <div class="bg-white rounded-lg shadow-xl w-full max-w-2xl">
      <div class="p-6">
        <h2 class="text-xl font-semibold mb-6">Add New Order</h2>
        
        <form @submit.prevent="handleSubmit" class="space-y-6">
          <!-- Doctor Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Doctor</label>
            <select 
              v-model="formData.doctor_id"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Select Doctor</option>
              <option v-for="doctor in doctors" :key="doctor.id" :value="doctor.id">
                {{ doctor.name }}
              </option>
            </select>
          </div>

          <!-- Date of Service -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Date of Service</label>
            <input 
              type="date" 
              v-model="formData.date_of_service"
              required
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
          </div>

          <!-- Product Selection -->
          <div>
            <label class="block text-sm font-medium text-gray-700">Product</label>
            <select 
              v-model="formData.product_id"
              required
              @change="handleProductChange"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Select Product</option>
              <option v-for="product in products" :key="product.id" :value="product.id">
                {{ product.name }}
              </option>
            </select>
          </div>

          <!-- Size Selection -->
          <div v-if="selectedProduct">
            <label class="block text-sm font-medium text-gray-700">Size</label>
            <select 
              v-model="formData.size"
              required
              @change="handleSizeChange"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
            >
              <option value="">Select Size</option>
              <option v-for="size in selectedProduct.size" :key="size" :value="size">
                {{ size }}
              </option>
            </select>
          </div>

          <!-- Auto-calculated Fields -->
          <div v-if="calculations" class="space-y-4">
            <div>
              <label class="block text-sm font-medium text-gray-700">Units</label>
              <input 
                type="number" 
                v-model="calculations.units"
                readonly
                class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Invoice Amount</label>
              <input 
                type="text" 
                :value="formatCurrency(calculations.invoiceAmount)"
                readonly
                class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">Expected Collection Date</label>
              <input 
                type="text" 
                :value="formatDate(calculations.expectedCollectionDate)"
                readonly
                class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              >
            </div>

            <div>
              <label class="block text-sm font-medium text-gray-700">MSC Commission</label>
              <input 
                type="text" 
                :value="formatCurrency(calculations.mscCommission)"
                readonly
                class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
              >
            </div>
          </div>

          <!-- Actions -->
          <div class="flex justify-end space-x-4 pt-4">
            <button 
              type="button"
              @click="$emit('close')"
              class="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md shadow-sm hover:bg-gray-50"
            >
              Cancel
            </button>
            <button 
              type="submit"
              :disabled="!isFormValid"
              class="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md shadow-sm hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Save Order
            </button>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Doctor, Product, OrderCalculations } from '@/types/models'
import { orderService } from '@/services/orderService'

const props = defineProps<{
  doctors: Doctor[]
  products: Product[]
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'order-added'): void
}>()

const formData = ref({
  doctor_id: '',
  date_of_service: '',
  product_id: '',
  size: ''
})

const selectedProduct = computed(() => {
  return props.products.find(p => p.id === formData.value.product_id)
})

const calculations = ref<OrderCalculations | null>(null)

const isFormValid = computed(() => {
  return (
    formData.value.doctor_id &&
    formData.value.date_of_service &&
    formData.value.product_id &&
    formData.value.size &&
    calculations.value
  )
})

const handleProductChange = async () => {
  formData.value.size = ''
  calculations.value = null
}

const handleSizeChange = async () => {
  if (!formData.value.product_id || !formData.value.size || !formData.value.date_of_service) {
    calculations.value = null
    return
  }

  calculations.value = await orderService.calculateOrderValues(
    formData.value.product_id,
    formData.value.size,
    formData.value.date_of_service
  )
}

const handleSubmit = async () => {
  if (!calculations.value) return

  try {
    const orderData = {
      doctor_id: formData.value.doctor_id,
      date_of_service: formData.value.date_of_service,
      product_id: formData.value.product_id,
      size: formData.value.size,
      units: calculations.value.units,
      invoice_to_doc: calculations.value.invoiceAmount,
      expected_collection_date: calculations.value.expectedCollectionDate,
      msc_commission: calculations.value.mscCommission,
      status: 'pending'
    }

    const { error } = await orderService.createOrder(orderData)

    if (error) {
      console.error('Error creating order:', error)
      return
    }

    emit('order-added')
  } catch (error) {
    console.error('Error submitting form:', error)
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
</script>