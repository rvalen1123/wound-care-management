<template>
  <div class="p-4">
    <Card>
      <!-- Header -->
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-semibold text-gray-800">
            {{ isEditing ? 'Edit Order' : 'New Order' }}
          </h1>
          <Button
            icon="pi pi-arrow-left"
            label="Back to Orders"
            text
            @click="router.push('/orders')"
          />
        </div>
      </template>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Doctor Selection -->
          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Doctor *</label>
            <Dropdown
              v-model="formData.doctor_id"
              :options="doctors"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Doctor"
              :class="{ 'p-invalid': v$.doctor_id.$error }"
              class="w-full"
            />
            <small class="text-red-500" v-if="v$.doctor_id.$error">
              {{ v$.doctor_id.$errors[0].$message }}
            </small>
          </div>

          <!-- Product Selection -->
          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Product *</label>
            <Dropdown
              v-model="formData.product_id"
              :options="products"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Product"
              :class="{ 'p-invalid': v$.product_id.$error }"
              class="w-full"
              @change="handleProductChange"
            />
            <small class="text-red-500" v-if="v$.product_id.$error">
              {{ v$.product_id.$errors[0].$message }}
            </small>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Service Date -->
          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Date of Service *</label>
            <Calendar
              v-model="formData.date_of_service"
              :showIcon="true"
              :maxDate="new Date()"
              dateFormat="yy-mm-dd"
              :class="{ 'p-invalid': v$.date_of_service.$error }"
              class="w-full"
            />
            <small class="text-red-500" v-if="v$.date_of_service.$error">
              {{ v$.date_of_service.$errors[0].$message }}
            </small>
          </div>

          <!-- Size Selection -->
          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Size *</label>
            <Dropdown
              v-model="formData.size"
              :options="selectedProduct?.sizes || []"
              placeholder="Select Size"
              :class="{ 'p-invalid': v$.size.$error }"
              class="w-full"
              @change="handleSizeChange"
              :disabled="!selectedProduct"
            />
            <small class="text-red-500" v-if="v$.size.$error">
              {{ v$.size.$errors[0].$message }}
            </small>
          </div>
        </div>

        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <!-- Units -->
          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Units *</label>
            <InputNumber
              v-model="formData.units"
              :minFractionDigits="2"
              :maxFractionDigits="2"
              :class="{ 'p-invalid': v$.units.$error }"
              class="w-full"
              @change="handleUnitsChange"
              :disabled="!selectedProduct"
            />
            <small class="text-red-500" v-if="v$.units.$error">
              {{ v$.units.$errors[0].$message }}
            </small>
          </div>

          <!-- Invoice Amount -->
          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Invoice Amount</label>
            <InputNumber
              v-model="formData.invoice_to_doc"
              mode="currency"
              currency="USD"
              :minFractionDigits="2"
              class="w-full"
              disabled
            />
            <small class="text-gray-500">
              Automatically calculated as 60% of ASP
            </small>
          </div>
        </div>

        <!-- Commission Information -->
        <div class="bg-gray-50 p-4 rounded-lg mt-6">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Commission Details</h3>
          <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
            <!-- MSC Commission -->
            <div class="flex flex-col">
              <label class="mb-1 text-sm text-gray-600">MSC Commission</label>
              <InputNumber
                v-model="formData.msc_commission"
                mode="currency"
                currency="USD"
                :minFractionDigits="2"
                class="w-full"
                disabled
              />
              <small class="text-gray-500">
                Based on product's default commission rate
              </small>
            </div>

            <!-- Expected Collection Date -->
            <div class="flex flex-col">
              <label class="mb-1 text-sm text-gray-600">Expected Collection Date</label>
              <Calendar
                v-model="formData.expected_collection_date"
                :showIcon="true"
                dateFormat="yy-mm-dd"
                class="w-full"
                disabled
              />
              <small class="text-gray-500">
                Automatically set to 60 days from service date
              </small>
            </div>
          </div>

          <!-- Rep Commission Breakdown -->
          <OrderCommissionBreakdown
            v-if="formData.msc_commission > 0"
            :commission-amount="formData.msc_commission"
            :product="selectedProduct"
          />
        </div>

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            text
            @click="router.back()"
          />
          <Button
            type="submit"
            :label="isEditing ? 'Update Order' : 'Create Order'"
            :loading="loading"
            severity="success"
          />
        </div>
      </form>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { useVuelidate } from '@vuelidate/core'
import { required, minValue } from '@vuelidate/validators'
import { useOrderStore } from '@/stores/orderStore'
import { useDoctorStore } from '@/stores/doctorStore'
import { useProductStore } from '@/stores/productStore'
import type { Order, Product } from '@/types/models'
import { Card } from '@/components/common/ui'
import OrderCommissionBreakdown from './OrderCommissionBreakdown.vue'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()
const doctorStore = useDoctorStore()
const productStore = useProductStore()

// State
const loading = ref(false)
const selectedProduct = ref<Product | null>(null)

const formData = ref<Partial<Order>>({
  doctor_id: null,
  product_id: null,
  date_of_service: null,
  size: '',
  units: 0,
  invoice_to_doc: 0,
  msc_commission: 0,
  expected_collection_date: null,
  status: 'pending'
})

// Computed
const isEditing = computed(() => !!route.params.id)
const doctors = computed(() => doctorStore.doctors)
const products = computed(() => productStore.products)

// Validation rules
const rules = {
  doctor_id: { required },
  product_id: { required },
  date_of_service: { required },
  size: { required },
  units: { required, minValue: minValue(0) }
}

const v$ = useVuelidate(rules, formData)

// Methods
async function handleSubmit() {
  const isValid = await v$.value.$validate()
  if (!isValid) return

  try {
    loading.value = true
    if (isEditing) {
      await orderStore.updateOrder(Number(route.params.id), formData.value)
    } else {
      await orderStore.createOrder(formData.value)
    }
    router.push('/orders')
  } catch (error) {
    // Error handling is done in the store
  } finally {
    loading.value = false
  }
}

function handleProductChange() {
  if (!formData.value.product_id) return
  
  selectedProduct.value = products.value.find(
    p => p.id === formData.value.product_id
  ) || null
  
  formData.value.size = ''
  formData.value.units = 0
  calculateOrderValues()
}

function handleSizeChange() {
  calculateOrderValues()
}

function handleUnitsChange() {
  calculateOrderValues()
}

function calculateOrderValues() {
  if (!selectedProduct.value || !formData.value.units) return

  const calculations = orderStore.calculateOrderValues({
    product: selectedProduct.value,
    units: formData.value.units,
    repId: '1' // This should come from the authenticated user or selection
  })

  formData.value.invoice_to_doc = calculations.invoiceAmount
  formData.value.msc_commission = calculations.mscCommission
  formData.value.expected_collection_date = calculations.expectedCollectionDate
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    doctorStore.fetchDoctors(),
    productStore.fetchProducts()
  ])

  if (isEditing) {
    const order = orderStore.getOrderById(Number(route.params.id))
    if (order) {
      formData.value = { ...order }
      selectedProduct.value = order.product || null
    }
  }
})
</script>
