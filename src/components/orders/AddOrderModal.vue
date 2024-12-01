<template>
  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center">
    <div class="bg-white rounded-lg p-6 max-w-lg w-full">
      <h2 class="text-lg font-semibold mb-4">Add New Order</h2>

      <form @submit.prevent="handleSubmit" class="space-y-4">
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

        <div>
          <label class="block text-sm font-medium text-gray-700">Product</label>
          <select
            v-model="formData.product_id"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select Product</option>
            <option v-for="product in products" :key="product.id" :value="product.id">
              {{ product.name }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Size</label>
          <select
            v-model="formData.size"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
            <option value="">Select Size</option>
            <option v-for="size in selectedProduct?.sizes" :key="size" :value="size">
              {{ size }}
            </option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Date of Service</label>
          <input
            type="date"
            v-model="formData.date_of_service"
            required
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Units</label>
          <input
            type="number"
            v-model.number="formData.units"
            required
            min="1"
            @input="calculateOrder"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
          >
        </div>

        <div v-if="calculations" class="space-y-2 p-4 bg-gray-50 rounded">
          <p>Invoice Amount: {{ formatCurrency(calculations.invoiceAmount) }}</p>
          <p>MSC Commission: {{ formatCurrency(calculations.mscCommission) }}</p>
          <p>Expected Collection: {{ new Date(calculations.expectedCollectionDate).toLocaleDateString() }}</p>
        </div>

        <div class="flex justify-end space-x-3">
          <button
            type="button"
            @click="$emit('close')"
            class="px-4 py-2 border rounded text-gray-700 hover:bg-gray-50"
          >
            Cancel
          </button>
          <button
            type="submit"
            class="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
          >
            Create Order
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue'
import type { Order, Doctor, Product } from '@/types/models'
import { orderService } from '@/services/orderService'
import { supabase } from '@/lib/supabaseClient'
import { formatCurrency } from '@/utils/formatters'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'order-added'): void
}>()

const doctors = ref<Doctor[]>([])
const products = ref<Product[]>([])

const formData = ref({
  doctor_id: '',
  product_id: '',
  date_of_service: '',
  size: '',
  units: 0
})

const calculations = ref<{
  units: number
  invoiceAmount: number
  expectedCollectionDate: string
  mscCommission: number
} | null>(null)

const selectedProduct = computed(() => {
  return products.value.find(p => p.id === formData.value.product_id) || null
})

const loadDoctors = async () => {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
    .order('name')

  if (error) throw error
  doctors.value = data
}

const loadProducts = async () => {
  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('name')

  if (error) throw error
  products.value = data
}

const calculateOrder = () => {
  if (!selectedProduct.value) return

  const units = formData.value.units
  const basePrice = selectedProduct.value.base_price || 0
  const invoiceAmount = units * basePrice

  // Add 30 days to the date of service for expected collection
  const serviceDate = new Date(formData.value.date_of_service)
  const expectedCollectionDate = new Date(serviceDate)
  expectedCollectionDate.setDate(expectedCollectionDate.getDate() + 30)

  // Calculate MSC commission (20% of invoice amount)
  const mscCommission = invoiceAmount * 0.2

  calculations.value = {
    units,
    invoiceAmount,
    expectedCollectionDate: expectedCollectionDate.toISOString(),
    mscCommission
  }
}

const handleSubmit = async () => {
  if (!calculations.value) return

  try {
    await orderService.createOrder({
      doctor_id: parseInt(formData.value.doctor_id),
      product_id: parseInt(formData.value.product_id),
      date_of_service: formData.value.date_of_service,
      size: formData.value.size,
      units: calculations.value.units,
      invoice_to_doc: calculations.value.invoiceAmount,
      expected_collection_date: calculations.value.expectedCollectionDate,
      msc_commission: calculations.value.mscCommission,
      status: 'pending'
    })

    emit('order-added')
  } catch (error) {
    console.error('Error creating order:', error)
  }
}

// Load initial data
loadDoctors()
loadProducts()
</script>