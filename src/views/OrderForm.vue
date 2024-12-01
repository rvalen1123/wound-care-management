import { useAuditLog } from '@/composables/useAuditLog'
const route = useRoute()
const router = useRouter()
const supabase = useSupabase()
const toast = useToast()
const commission: UseCommissionReturn = useCommission()
const { logAuditEvent } = useAuditLog()

const getCurrentUserId = async () => {
  const { data: { session } } = await supabase.auth.getSession()
  return session?.user?.id || 'system'
}

<template>
  <div class="container mx-auto px-4 py-6">
    <div class="bg-white rounded-lg shadow-md p-6">
      <h1 class="text-2xl font-bold mb-6">
        {{ isEditing ? 'Edit Order' : 'Create New Order' }}
      </h1>

      <form @submit.prevent="saveOrder" class="space-y-6">
        <!-- Basic Order Information -->
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700">Order Number</label>
            <InputText v-model="order.order_number" required />
          </div>

          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700">Date of Service</label>
            <Calendar v-model="order.date_of_service" required />
          </div>

          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700">Credit Terms</label>
            <Dropdown 
              v-model="order.credit_terms"
              :options="['net 30', 'net 60', 'net 90']"
              placeholder="Select Terms"
              required
            />
          </div>

          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700">Doctor</label>
            <Dropdown
              v-model="order.doctor_id"
              :options="doctors"
              optionLabel="doctor_name"
              optionValue="doctor_id"
              placeholder="Select Doctor"
              required
            />
          </div>

          <div class="form-group">
            <label class="block text-sm font-medium text-gray-700">Patient ID (De-identified)</label>
            <InputText v-model="order.patient_id" required />
          </div>
        </div>

        <!-- Product Information -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold">Product Details</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Product</label>
              <Dropdown
                v-model="order.product_id"
                :options="products"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Product"
                @change="handleProductChange"
                required
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Size</label>
              <Dropdown
                v-model="order.size"
                :options="['2x3', '4x4', '6x6']"
                placeholder="Select Size"
                @change="calculateUnits"
                required
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Units</label>
              <InputNumber v-model="order.units" readonly />
            </div>
          </div>

          <!-- Historical Pricing -->
          <div v-if="pricingHistory.length > 0" class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Historical Pricing</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Quarter</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">National ASP</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Effective Date</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="price in pricingHistory" :key="price.id" class="hover:bg-gray-100">
                    <td class="px-4 py-2">{{ price.quarter }}</td>
                    <td class="px-4 py-2">${{ formatCurrency(price.national_asp) }}</td>
                    <td class="px-4 py-2">{{ formatDate(price.effective_date) }}</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <!-- Financial Information -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold">Financial Details</h2>
          
          <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Invoice Amount (Medicare)</label>
              <InputNumber 
                v-model="order.invoice_billed_medicare" 
                mode="currency" 
                currency="USD"
                @change="calculateDoctorInvoice"
                required 
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Doctor Discount Rate (%)</label>
              <InputNumber 
                v-model="order.doctor_discount_rate" 
                :min="0" 
                :max="100"
                @change="calculateDoctorInvoice"
                required
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Invoice to Doctor</label>
              <InputNumber 
                v-model="order.invoice_to_doctor" 
                mode="currency" 
                currency="USD"
                readonly 
              />
            </div>
          </div>

          <!-- Payment Information (for editing) -->
          <div v-if="isEditing && payments.length > 0" class="bg-gray-50 p-4 rounded-lg">
            <h3 class="text-sm font-medium text-gray-700 mb-2">Payment History</h3>
            <div class="overflow-x-auto">
              <table class="min-w-full divide-y divide-gray-200">
                <thead>
                  <tr>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Date</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Amount</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Recipient</th>
                    <th class="px-4 py-2 text-left text-xs font-medium text-gray-500">Status</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-100">
                    <td class="px-4 py-2">{{ formatDate(payment.payment_date) }}</td>
                    <td class="px-4 py-2">${{ formatCurrency(payment.amount) }}</td>
                    <td class="px-4 py-2">{{ payment.recipient?.name || '-' }}</td>
                    <td class="px-4 py-2">
                      <Tag :value="payment.status" :severity="getPaymentStatusSeverity(payment.status)" />
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div class="mt-4 grid grid-cols-2 gap-4">
              <div>
                <span class="text-sm text-gray-600">Total Paid:</span>
                <p class="text-lg font-semibold">${{ formatCurrency(totalPaidAmount) }}</p>
              </div>
              <div>
                <span class="text-sm text-gray-600">Remaining:</span>
                <p class="text-lg font-semibold">${{ formatCurrency(remainingAmount) }}</p>
              </div>
            </div>
          </div>
        </div>

        <!-- Commission Structure -->
        <div class="space-y-4">
          <h2 class="text-lg font-semibold">Commission Structure</h2>
          
          <!-- Master Rep -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Master Rep</label>
              <Dropdown
                v-model="order.master_rep_id"
                :options="masterReps"
                optionLabel="rep_name"
                optionValue="rep_id"
                placeholder="Select Master Rep"
                @change="handleMasterRepChange"
                required
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
              <InputNumber 
                v-model="order.master_rep_rate" 
                :min="0" 
                :max="100"
                @change="validateCommissionRates"
                required
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Commission Amount</label>
              <InputNumber 
                v-model="commissionAmounts.masterRep" 
                mode="currency" 
                currency="USD"
                readonly 
              />
            </div>
          </div>

          <!-- Sub Rep -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Sub Rep</label>
              <Dropdown
                v-model="order.sub_rep_id"
                :options="subReps"
                optionLabel="rep_name"
                optionValue="rep_id"
                placeholder="Select Sub Rep"
                @change="handleSubRepChange"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
              <InputNumber 
                v-model="order.sub_rep_rate" 
                :min="0" 
                :max="100"
                :disabled="!order.sub_rep_id"
                @change="validateCommissionRates"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Commission Amount</label>
              <InputNumber 
                v-model="commissionAmounts.subRep" 
                mode="currency" 
                currency="USD"
                readonly 
              />
            </div>
          </div>

          <!-- Sub-Sub Rep -->
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6 p-4 bg-gray-50 rounded-lg">
            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Sub-Sub Rep</label>
              <Dropdown
                v-model="order.sub_sub_rep_id"
                :options="subSubReps"
                optionLabel="rep_name"
                optionValue="rep_id"
                placeholder="Select Sub-Sub Rep"
                @change="handleSubSubRepChange"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Commission Rate (%)</label>
              <InputNumber 
                v-model="order.sub_sub_rep_rate" 
                :min="0" 
                :max="100"
                :disabled="!order.sub_sub_rep_id"
                @change="validateCommissionRates"
              />
            </div>

            <div class="form-group">
              <label class="block text-sm font-medium text-gray-700">Commission Amount</label>
              <InputNumber 
                v-model="commissionAmounts.subSubRep" 
                mode="currency" 
                currency="USD"
                readonly 
              />
            </div>
          </div>

          <!-- Commission Summary -->
          <div class="mt-4 p-4 bg-white rounded-lg border">
            <div class="flex justify-between items-center">
              <div>
                <span class="text-sm text-gray-600">Total Commission Rate:</span>
                <span :class="{'text-red-600': totalCommissionRate > 100, 'text-green-600': totalCommissionRate <= 100}" 
                      class="ml-2 font-semibold">
                  {{ totalCommissionRate }}%
                </span>
              </div>
              <div>
                <span class="text-sm text-gray-600">Total Commission Amount:</span>
                <span class="ml-2 font-semibold">${{ formatCurrency(totalCommissionAmount) }}</span>
              </div>
            </div>
            <div v-if="totalCommissionRate > 100" class="mt-2 text-sm text-red-600">
              Total commission rate cannot exceed 100%
            </div>
          </div>
        </div>

        <!-- Order Status -->
        <div v-if="isEditing" class="bg-gray-50 p-4 rounded-lg">
          <div class="flex items-center justify-between">
            <div>
              <span class="text-sm text-gray-600">Order Status:</span>
              <Tag 
                :value="orderStatus.label"
                :severity="orderStatus.color"
                class="ml-2"
              />
            </div>
            <div>
              <span class="text-sm text-gray-600">Expected Collection Date:</span>
              <span class="ml-2 font-medium">{{ order.expected_collection_date ? formatDate(order.expected_collection_date) : '' }}</span>
            </div>
          </div>
        </div>

        <!-- Submit Buttons -->
        <div class="flex justify-end space-x-4">
          <Button 
            type="button"
            label="Cancel" 
            severity="secondary"
            @click="router.back()"
          />
          <Button 
            type="submit"
            :label="isEditing ? 'Update Order' : 'Create Order'"
            :loading="saving"
            severity="primary"
          />
        </div>
      </form>
    </div>
  </div>
</template> 
<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useSupabase } from '@/composables/useSupabase'
import { useCommission, type UseCommissionReturn } from '@/composables/useCommission'
import { useAuditLog } from '@/composables/useAuditLog'
import { useToast } from 'primevue/usetoast'

// Import PrimeVue components
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import Dropdown from 'primevue/dropdown'
import Calendar from 'primevue/calendar'
import Button from 'primevue/button'
import Tag from 'primevue/tag'

interface OrderFormData {
  order_id?: string
  order_number: string
  date_of_service: string
  credit_terms: string
  doctor_id: string | null
  patient_id: string
  product_id: string | null
  size: string
  units: number
  invoice_billed_medicare: number
  doctor_discount_rate: number
  invoice_to_doctor: number | null
  master_rep_id: string | null
  master_rep_rate: number | null
  sub_rep_id: string | null
  sub_rep_rate: number | null
  sub_sub_rep_id: string | null
  sub_sub_rep_rate: number | null
  status?: string
  expected_collection_date?: string
}

interface Representative {
  rep_id: string
  rep_name: string
  role: 'master' | 'sub' | 'sub-sub'
  default_commission_rate: number
}

interface Doctor {
  doctor_id: string
  doctor_name: string
}

interface Product {
  id: string
  name: string
  national_asp: number
}

interface Payment {
  id: string
  order_id: string
  amount: number
  payment_date: string
  recipient_type: 'manufacturer' | 'master_rep' | 'sub_rep' | 'sub_sub_rep'
  recipient_id: string
  status: 'pending' | 'processed' | 'failed'
  recipient?: { name: string }
}

interface PricingHistory {
  id: string
  product_id: string
  quarter: string
  national_asp: number
  effective_date: string
}

// Composables
const route = useRoute()
const router = useRouter()
const supabase = useSupabase()
const toast = useToast()
const commission: UseCommissionReturn = useCommission()
const { logAuditEvent } = useAuditLog()

// State
const isEditing = ref(false)
const saving = ref(false)
const doctors = ref<Doctor[]>([])
const products = ref<Product[]>([])
const masterReps = ref<Representative[]>([])
const subReps = ref<Representative[]>([])
const subSubReps = ref<Representative[]>([])
const pricingHistory = ref<PricingHistory[]>([])
const payments = ref<Payment[]>([])

const order = ref<OrderFormData>({
  order_number: '',
  date_of_service: '',
  credit_terms: 'net 60',
  doctor_id: null,
  patient_id: '',
  product_id: null,
  size: '',
  units: 0,
  invoice_billed_medicare: 0,
  doctor_discount_rate: 40,
  invoice_to_doctor: null,
  master_rep_id: null,
  master_rep_rate: null,
  sub_rep_id: null,
  sub_rep_rate: null,
  sub_sub_rep_id: null,
  sub_sub_rep_rate: null
})

const commissionAmounts = ref({
  masterRep: 0,
  subRep: 0,
  subSubRep: 0
})

// Computed
const totalCommissionRate = computed(() => {
  return (
    Number(order.value.master_rep_rate || 0) +
    Number(order.value.sub_rep_rate || 0) +
    Number(order.value.sub_sub_rep_rate || 0)
  )
})

const totalCommissionAmount = computed(() => {
  return commissionAmounts.value.masterRep +
         commissionAmounts.value.subRep +
         commissionAmounts.value.subSubRep
})

const totalPaidAmount = computed(() => {
  return payments.value.reduce((total, payment) => {
    return total + (payment.status === 'processed' ? payment.amount : 0)
  }, 0)
})

const remainingAmount = computed(() => {
  return (order.value.invoice_to_doctor || 0) - totalPaidAmount.value
})
// Methods
const formatCurrency = (value: number): string => {
  return value.toFixed(2)
}

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString()
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
    .select('*')
    .order('name')

  if (error) {
    console.error('Error loading products:', error)
    return
  }

  products.value = data
}

const loadReps = async () => {
  const { data: masterRepsData, error: masterError } = await supabase
    .from('representatives')
    .select('*')
    .eq('role', 'master')
    .order('rep_name')

  if (masterError) {
    console.error('Error loading master reps:', masterError)
    return
  }

  masterReps.value = masterRepsData

  const { data: subRepsData, error: subError } = await supabase
    .from('representatives')
    .select('*')
    .eq('role', 'sub')
    .order('rep_name')

  if (subError) {
    console.error('Error loading sub reps:', subError)
    return
  }

  subReps.value = subRepsData

  const { data: subSubRepsData, error: subSubError } = await supabase
    .from('representatives')
    .select('*')
    .eq('role', 'sub-sub')
    .order('rep_name')

  if (subSubError) {
    console.error('Error loading sub-sub reps:', subSubError)
    return
  }

  subSubReps.value = subSubRepsData
}

const calculateCommissions = () => {
  if (!order.value.invoice_to_doctor) return

  const totalCommission = order.value.invoice_to_doctor * 0.4 // 40% of invoice amount
  const breakdown = commission.calculateCommissionBreakdown(
    totalCommission,
    order.value.master_rep_rate || 0,
    order.value.sub_rep_rate || 0,
    order.value.sub_sub_rep_rate || 0
  )

  commissionAmounts.value = {
    masterRep: breakdown.masterRepCommission,
    subRep: breakdown.subRepCommission,
    subSubRep: breakdown.subSubRepCommission
  }
}
// Add orderStatus computed property
const orderStatus = computed(() => {
  if (!order.value.invoice_to_doctor) {
    return { label: 'Pending', color: 'warning' }
  }

  const paidRatio = totalPaidAmount.value / order.value.invoice_to_doctor

  if (paidRatio === 0) {
    return { label: 'Outstanding', color: 'danger' }
  }
  if (paidRatio < 1) {
    return { label: 'Partially Paid', color: 'warning' }
  }
  return { label: 'Paid', color: 'success' }
})

// Add product handling methods
const handleProductChange = async (event: any) => {
  const selectedProduct = products.value.find(p => p.id === event.value)
  if (selectedProduct) {
    // Auto-calculate invoice amount based on ASP and units
    order.value.invoice_billed_medicare = selectedProduct.national_asp * order.value.units
    calculateDoctorInvoice()
  }
}

const calculateUnits = () => {
  // Calculate units based on size
  const sizeMap: Record<string, number> = {
    '2x3': 6,
    '4x4': 16,
    '6x6': 36
  }
  order.value.units = sizeMap[order.value.size] || 0
  
  // Recalculate invoice if product is selected
  if (order.value.product_id) {
    handleProductChange({ value: order.value.product_id })
  }
}

const handleMasterRepChange = async () => {
  if (!order.value.master_rep_id) return

  const { data, error } = await supabase
    .from('representatives')
    .select('default_commission_rate')
    .eq('rep_id', order.value.master_rep_id)
    .single()

  if (error) {
    console.error('Error getting master rep commission rate:', error)
    return
  }

  const oldRate = order.value.master_rep_rate
  order.value.master_rep_rate = data.default_commission_rate || 100
  
  await logAuditEvent({
    table_name: 'orders',
    record_id: order.value.order_id || 'new',
    action: 'update',
    old_values: { master_rep_rate: oldRate },
    new_values: { master_rep_rate: order.value.master_rep_rate },
    changed_by: (await supabase.auth.getSession()).data.session?.user?.id || 'system'
  })
  
  calculateCommissions()
}

const handleSubRepChange = async () => {
  if (!order.value.sub_rep_id) {
    order.value.sub_rep_rate = 0
    calculateCommissions()
    return
  }

  const { data, error } = await supabase
    .from('representatives')
    .select('default_commission_rate')
    .eq('rep_id', order.value.sub_rep_id)
    .single()

  if (error) {
    console.error('Error getting sub rep commission rate:', error)
    return
  }

  const oldRate = order.value.sub_rep_rate
  order.value.sub_rep_rate = data.default_commission_rate || 0
  
  await logAuditEvent({
    table_name: 'orders',
    record_id: order.value.order_id || 'new',
    action: 'update',
    old_values: { sub_rep_rate: oldRate },
    new_values: { sub_rep_rate: order.value.sub_rep_rate },
    changed_by: (await supabase.auth.getSession()).data.session?.user?.id || 'system'
  })
  
  calculateCommissions()
}
const handleSubSubRepChange = async () => {
  if (!order.value.sub_sub_rep_id) {
    order.value.sub_sub_rep_rate = 0
    calculateCommissions()
    return
  }

  const { data, error } = await supabase
    .from('representatives')
    .select('default_commission_rate')
    .eq('rep_id', order.value.sub_sub_rep_id)
    .single()

  if (error) {
    console.error('Error getting sub-sub rep commission rate:', error)
    return
  }

  const oldRate = order.value.sub_sub_rep_rate
  order.value.sub_sub_rep_rate = data.default_commission_rate || 0
  
  await logAuditEvent({
    table_name: 'orders',
    record_id: order.value.order_id || 'new',
    action: 'update',
    old_values: { sub_sub_rep_rate: oldRate },
    new_values: { sub_sub_rep_rate: order.value.sub_sub_rep_rate },
    changed_by: (await supabase.auth.getSession()).data.session?.user?.id || 'system'
  })
  
  calculateCommissions()
}

const validateCommissionRates = () => {
  if (totalCommissionRate.value > 100) {
    toast.add({
      severity: 'error',
      summary: 'Invalid Commission Rates',
      detail: 'Total commission rate cannot exceed 100%',
      life: 3000
    })
    return false
  }
  calculateCommissions()
  return true
}

const calculateDoctorInvoice = async () => {
  if (order.value.invoice_billed_medicare && order.value.doctor_discount_rate) {
    const previousInvoice = order.value.invoice_to_doctor
    order.value.invoice_to_doctor = 
      order.value.invoice_billed_medicare * (1 - (order.value.doctor_discount_rate / 100))
    
    if (previousInvoice !== order.value.invoice_to_doctor) {
      await logAuditEvent({
        table_name: 'orders',
        record_id: order.value.order_id || 'new',
        action: 'update',
        old_values: { invoice_to_doctor: previousInvoice },
        new_values: { invoice_to_doctor: order.value.invoice_to_doctor },
        changed_by: (await supabase.auth.getSession()).data.session?.user?.id || 'system'
      })
    }

    calculateCommissions()
  }
}
const validateOrder = () => {
  const errors: string[] = []

  if (!order.value.doctor_id) errors.push('Doctor is required')
  if (!order.value.date_of_service) errors.push('Date of service is required')
  if (!order.value.product_id) errors.push('Product is required')
  if (!order.value.size) errors.push('Size is required')
  if (!order.value.units) errors.push('Units is required')
  if (!order.value.invoice_billed_medicare) errors.push('Invoice amount is required')
  if (!order.value.master_rep_id) errors.push('Master rep is required')

  if (errors.length > 0) {
    errors.forEach(error => {
      toast.add({
        severity: 'error',
        summary: 'Validation Error',
        detail: error,
        life: 3000
      })
    })
    return false
  }

  return true
}

const getPaymentStatusSeverity = (status: string): string => {
  switch (status) {
    case 'processed':
      return 'success'
    case 'pending':
      return 'warning'
    case 'failed':
      return 'danger'
    default:
      return 'info'
  }
}

const saveOrder = async () => {
  if (!validateOrder() || !validateCommissionRates()) return

  saving.value = true
  try {
    const { data: savedOrder, error: orderError } = await supabase
      .from('orders')
      .upsert({
        ...order.value,
        status: 'pending',
        expected_collection_date: new Date(order.value.date_of_service).setDate(
          new Date(order.value.date_of_service).getDate() + 60
        )
      })
      .select()
      .single()

    if (orderError) throw orderError

    await logAuditEvent({
      table_name: 'orders',
      record_id: savedOrder.order_id,
      action: isEditing.value ? 'update' : 'insert',
      new_values: savedOrder,
      changed_by: (await supabase.auth.getSession()).data.session?.user?.id || 'system'
    })

    toast.add({
      severity: 'success',
      summary: 'Success',
      detail: 'Order saved successfully',
      life: 3000
    })

    router.push(`/orders/${savedOrder.order_id}`)
  } catch (error) {
    console.error('Error saving order:', error)
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: 'Failed to save order',
      life: 3000
    })
  } finally {
    saving.value = false
  }
}
// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadDoctors(),
    loadProducts(),
    loadReps()
  ])

  if (route.params.id) {
    isEditing.value = true
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        commission_structures (
          master_rep_rate,
          sub_rep_rate,
          sub_sub_rep_rate
        ),
        doctor:doctor_id (doctor_name),
        product:product_id (*)
      `)
      .eq('order_id', route.params.id)
      .single()

    if (error) {
      console.error('Error loading order:', error)
      return
    }

    if (data) {
      order.value = {
        ...order.value,
        ...data,
        master_rep_rate: data.commission_structures?.[0]?.master_rep_rate,
        sub_rep_rate: data.commission_structures?.[0]?.sub_rep_rate,
        sub_sub_rep_rate: data.commission_structures?.[0]?.sub_sub_rep_rate
      }

      calculateCommissions()
    }
  }
})
</script>

<style scoped>
.form-group {
  @apply flex flex-col space-y-1;
}

.form-group label {
  @apply text-sm font-medium text-gray-700;
}
</style>
