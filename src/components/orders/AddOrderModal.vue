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
import type { Product, Doctor } from '@/types'
import { orderService } from '@/services/orderService'
import { supabase } from '@/lib/supabaseClient'

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'order-created'): void
}>()

const doctors = ref<Doctor[]>([])
const products = ref<Product[]>([])

const formData = ref({
  doctor_id: '',
  product_id: '',
  size: '',
  date_of_service: '',
  units: 1
})

const calculations = ref<{
  invoiceAmount: number
  mscCommission: number
  expectedCollectionDate: string
} | null>(null)

const selectedProduct = computed(() => 
  products.value.find(p => p.id === formData.value.product_id)
)

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount)

async function loadDoctors() {
  const { data, error } = await supabase
    .from('doctors')
    .select('*')
  
  if (error) console.error('Error loading doctors:', error)
  else doctors.value = data
}

async function loadProducts() {
  const { data, error } = await supabase
    .from('products')
    .select('*')
  
  if (error) console.error('Error loading products:', error)
  else products.value = data
}

function calculateOrder() {
  if (!selectedProduct.value || !formData.value.units) {
    calculations.value = null
    return
  }

  const product = selectedProduct.value
  const units = formData.value.units

  const invoiceAmount = product.national_asp * units
  const mscCommission = invoiceAmount * 0.15 // 15% commission
  const expectedCollectionDate = new Date()
  expectedCollectionDate.setDate(expectedCollectionDate.getDate() + 30) // 30 days from now

  calculations.value = {
    invoiceAmount,
    mscCommission,
    expectedCollectionDate: expectedCollectionDate.toISOString()
  }
}

async function handleSubmit() {
  if (!calculations.value) return

  try {
    const orderData = {
      ...formData.value,
      doctor_id: parseInt(formData.value.doctor_id),
      product_id: parseInt(formData.value.product_id),
      invoice_amount: calculations.value.invoiceAmount,
      msc_commission: calculations.value.mscCommission,
      expected_collection_date: calculations.value.expectedCollectionDate,
      status: 'pending' as const
    }

    await orderService.createOrder(orderData)
    emit('order-created')
    emit('close')
  } catch (error) {
    console.error('Error creating order:', error)
  }
}

// Load initial data
loadDoctors()
loadProducts()
</script>