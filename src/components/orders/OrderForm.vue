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
              :error="v$.doctor_id.$error ? v$.doctor_id.$errors[0].$message : ''"
              class="w-full"
            />
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
              :error="v$.product_id.$error ? v$.product_id.$errors[0].$message : ''"
              class="w-full"
              @change="handleProductChange"
            />
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
              :error="v$.date_of_service.$error ? v$.date_of_service.$errors[0].$message : ''"
              class="w-full"
            />
          </div>

          <!-- Size Selection -->
          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Size *</label>
            <Dropdown
              v-model="formData.size"
              :options="selectedProduct?.sizes || []"
              placeholder="Select Size"
              :error="v$.size.$error ? v$.size.$errors[0].$message : ''"
              class="w-full"
              @change="handleSizeChange"
              :disabled="!selectedProduct"
            />
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
              :error="v$.units.$error ? v$.units.$errors[0].$message : ''"
              class="w-full"
              @input="handleUnitsChange"
              :disabled="!selectedProduct"
            />
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

        <!-- Rep Selection -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Rep Assignment</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <!-- Master Rep -->
            <div class="flex flex-col">
              <label class="mb-1 text-sm text-gray-600">Master Rep *</label>
              <Dropdown
                v-model="formData.master_rep_id"
                :options="masterReps"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Master Rep"
                :error="v$.master_rep_id.$error ? v$.master_rep_id.$errors[0].$message : ''"
                class="w-full"
                @change="handleMasterRepChange"
              />
            </div>

            <!-- Sub Rep -->
            <div class="flex flex-col">
              <label class="mb-1 text-sm text-gray-600">Sub Rep</label>
              <Dropdown
                v-model="formData.sub_rep_id"
                :options="subReps"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Sub Rep"
                class="w-full"
                :disabled="!formData.master_rep_id"
                @change="handleSubRepChange"
              />
            </div>

            <!-- Sub-Sub Rep -->
            <div class="flex flex-col">
              <label class="mb-1 text-sm text-gray-600">Sub-Sub Rep</label>
              <Dropdown
                v-model="formData.sub_sub_rep_id"
                :options="subSubReps"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Sub-Sub Rep"
                class="w-full"
                :disabled="!formData.sub_rep_id"
              />
            </div>
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
            :master-rep-id="formData.master_rep_id"
            :sub-rep-id="formData.sub_rep_id"
            :sub-sub-rep-id="formData.sub_sub_rep_id"
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
import { useRepStore } from '@/stores/repStore'
import type { Order, Product, Representative } from '@/types/models'
import { Card, Button, Dropdown, Calendar, InputNumber } from '@/components/common/ui'
import OrderCommissionBreakdown from './OrderCommissionBreakdown.vue'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()
const doctorStore = useDoctorStore()
const productStore = useProductStore()
const repStore = useRepStore()

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
  status: 'pending',
  master_rep_id: null,
  sub_rep_id: null,
  sub_sub_rep_id: null
})

// Computed
const isEditing = computed(() => !!route.params.id)
const doctors = computed(() => doctorStore.doctors)
const products = computed(() => productStore.products)
const masterReps = computed(() => repStore.getRepsByRole('master'))
const subReps = computed(() =>
  formData.value.master_rep_id
    ? repStore.getSubReps(formData.value.master_rep_id)
    : []
)
const subSubReps = computed(() =>
  formData.value.sub_rep_id
    ? repStore.getSubSubReps(formData.value.sub_rep_id)
    : []
)

// Validation rules
const rules = {
  doctor_id: { required },
  product_id: { required },
  date_of_service: { required },
  size: { required },
  units: { required, minValue: minValue(0) },
  master_rep_id: { required }
}

const v$ = useVuelidate(rules, formData)

// Methods
async function handleSubmit() {
  const isValid = await v$.$validate()
  if (!isValid) return

  try {
    loading.value = true
    if (isEditing.value) {
      await orderStore.updateOrder(route.params.id as string, formData.value)
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

  selectedProduct.value =
    products.value.find(
      (p: Product) => p.id === formData.value.product_id
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

function handleMasterRepChange() {
  formData.value.sub_rep_id = null
  formData.value.sub_sub_rep_id = null
  calculateCommission()
}

function handleSubRepChange() {
  formData.value.sub_sub_rep_id = null
  calculateCommission()
}

function calculateOrderValues() {
  if (!selectedProduct.value || !formData.value.units) return

  const calculations = orderStore.calculateOrderValues({
    product: selectedProduct.value,
    units: formData.value.units
  })

  formData.value.invoice_to_doc = calculations.invoiceAmount
  formData.value.msc_commission = calculations.mscCommission
  formData.value.expected_collection_date = calculations.expectedCollectionDate

  calculateCommission()
}

function calculateCommission() {
  if (!formData.value.msc_commission) return

  const commissionStructure = orderStore.calculateCommissionStructure({
    mscCommission: formData.value.msc_commission,
    masterRepId: formData.value.master_rep_id,
    subRepId: formData.value.sub_rep_id,
    subSubRepId: formData.value.sub_sub_rep_id
  })

  // Commission structure will be saved along with the order
  formData.value.commission_structure = commissionStructure
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    doctorStore.fetchDoctors(),
    productStore.fetchProducts(),
    repStore.fetchReps()
  ])

  if (isEditing.value) {
    const order = await orderStore.getOrderById(route.params.id as string)
    if (order) {
      formData.value = { ...order }
      selectedProduct.value =
        products.value.find((p: Product) => p.id === order.product_id) || null
    }
  }
})
</script>
