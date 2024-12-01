  <div class="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity">
    <div class="fixed inset-0 z-10 overflow-y-auto">
      <div class="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
        <div class="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-3xl sm:p-6">
          <div class="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
            <button
              type="button"
              @click="$emit('close')"
              class="rounded-md bg-white text-gray-400 hover:text-gray-500"
            >
              <span class="sr-only">Close</span>
              <svg class="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          <div class="sm:flex sm:items-start">
            <div class="mt-3 text-center sm:mt-0 sm:text-left w-full">
              <h3 class="text-lg font-semibold leading-6 text-gray-900">Add New Order</h3>
              
              <form @submit.prevent="handleSubmit" class="mt-6">
                <!-- Doctor Selection -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700">Doctor</label>
                  <select 
                    v-model="formData.doctorId"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select a doctor</option>
                    <option v-for="doctor in doctors" :key="doctor.doctor_id" :value="doctor.doctor_id">
                      {{ doctor.doctor_name }}
                    </option>
                  </select>
                </div>

                <!-- Date of Service -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700">Date of Service</label>
                  <input 
                    type="date"
                    v-model="formData.dateOfService"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                </div>

                <!-- Product Selection -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700">Product</label>
                  <select 
                    v-model="formData.productId"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    @change="handleProductChange"
                  >
                    <option value="">Select a product</option>
                    <option v-for="product in products" :key="product.id" :value="product.id">
                      {{ product.Product }}
                    </option>
                  </select>
                </div>

                <!-- Size Selection -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700">Size</label>
                  <select 
                    v-model="formData.size"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                    @change="calculateUnits"
                  >
                    <option value="">Select size</option>
                    <option value="2x3">2x3</option>
                    <option value="4x4">4x4</option>
                    <option value="6x6">6x6</option>
                  </select>
                </div>

                <!-- Units (Auto-calculated) -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700">Units</label>
                  <input 
                    type="number"
                    v-model="formData.units"
                    readonly
                    class="mt-1 block w-full rounded-md border-gray-300 bg-gray-50 shadow-sm"
                  >
                </div>

                <!-- Invoice Amount -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700">Invoice Amount</label>
                  <div class="mt-1 relative rounded-md shadow-sm">
                    <div class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                      <span class="text-gray-500 sm:text-sm">$</span>
                    </div>
                    <input 
                      type="number"
                      v-model="formData.invoiceAmount"
                      step="0.01"
                      required
                      class="block w-full rounded-md border-gray-300 pl-7 shadow-sm"
                    >
                  </div>
                </div>

                <!-- Rep Selection -->
                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700">Master Rep</label>
                  <select 
                    v-model="formData.masterRepId"
                    required
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select master rep</option>
                    <option v-for="rep in masterReps" :key="rep.rep_id" :value="rep.rep_id">
                      {{ rep.rep_name }}
                    </option>
                  </select>
                </div>

                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700">Sub Rep (Optional)</label>
                  <select 
                    v-model="formData.subRepId"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select sub rep</option>
                    <option v-for="rep in subReps" :key="rep.rep_id" :value="rep.rep_id">
                      {{ rep.rep_name }}
                    </option>
                  </select>
                </div>

                <div class="mb-6">
                  <label class="block text-sm font-medium text-gray-700">Sub-Sub Rep (Optional)</label>
                  <select 
                    v-model="formData.subSubRepId"
                    class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                  >
                    <option value="">Select sub-sub rep</option>
                    <option v-for="rep in subSubReps" :key="rep.rep_id" :value="rep.rep_id">
                      {{ rep.rep_name }}
                    </option>
                  </select>
                </div>

                <!-- Commission Structure -->
                <div class="mb-6 bg-gray-50 p-4 rounded-md">
                  <h4 class="text-sm font-medium text-gray-900 mb-4">Commission Structure</h4>
                  
                  <div class="grid grid-cols-3 gap-4">
                    <div>
                      <label class="block text-sm font-medium text-gray-700">Master Rep Rate (%)</label>
                      <input 
                        type="number"
                        v-model="formData.masterRepRate"
                        required
                        min="0"
                        max="100"
                        step="0.01"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      >
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Sub Rep Rate (%)</label>
                      <input 
                        type="number"
                        v-model="formData.subRepRate"
                        min="0"
                        max="100"
                        step="0.01"
                        :disabled="!formData.subRepId"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      >
                    </div>

                    <div>
                      <label class="block text-sm font-medium text-gray-700">Sub-Sub Rep Rate (%)</label>
                      <input 
                        type="number"
                        v-model="formData.subSubRepRate"
                        min="0"
                        max="100"
                        step="0.01"
                        :disabled="!formData.subSubRepId"
                        class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
                      >
                    </div>
                  </div>

                  <div class="mt-2">
                    <p class="text-sm" :class="totalRate > 100 ? 'text-red-600' : 'text-green-600'">
                      Total Commission Rate: {{ totalRate }}%
                    </p>
                  </div>
                </div>

                <!-- Submit Buttons -->
                <div class="mt-6 flex justify-end gap-3">
                  <button
                    type="button"
                    @click="$emit('close')"
                    class="rounded-md bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    :disabled="!isValid"
                    class="rounded-md bg-blue-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-blue-500 disabled:opacity-50"
                  >
                    Create Order
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const supabase = useSupabase()

// Props & Emits
defineEmits(['close', 'order-added'])

// State
const doctors = ref([])
const products = ref([])
const masterReps = ref([])
const subReps = ref([])
const subSubReps = ref([])

const formData = ref({
  doctorId: '',
  dateOfService: '',
  productId: '',
  size: '',
  units: 0,
  invoiceAmount: 0,
  masterRepId: '',
  subRepId: '',
  subSubRepId: '',
  masterRepRate: 100,
  subRepRate: 0,
  subSubRepRate: 0
})

// Computed
const totalRate = computed(() => {
  return (
    Number(formData.value.masterRepRate || 0) +
    Number(formData.value.subRepRate || 0) +
    Number(formData.value.subSubRepRate || 0)
  )
})

const isValid = computed(() => {
  return (
    formData.value.doctorId &&
    formData.value.dateOfService &&
    formData.value.productId &&
    formData.value.size &&
    formData.value.units > 0 &&
    formData.value.invoiceAmount > 0 &&
    formData.value.masterRepId &&
    totalRate.value <= 100
  )
})

// Methods
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
    .order('Product')

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

const calculateUnits = () => {
  const size = formData.value.size
  formData.value.units = {
    '2x3': 6,
    '4x4': 16,
    '6x6': 36
  }[size] || 0
}

const handleProductChange = () => {
  const product = products.value.find(p => p.id === formData.value.productId)
  if (product) {
    // Auto-calculate invoice amount based on ASP and doctor discount
    formData.value.invoiceAmount = product.national_asp * 0.6 // 60% of ASP
  }
}

const handleSubmit = async () => {
  const { data: order, error: orderError } = await supabase
    .from('orders')
    .insert({
      doctor_id: formData.value.doctorId,
      date_of_service: formData.value.dateOfService,
      product_id: formData.value.productId,
      size: formData.value.size,
      units: formData.value.units,
      invoice_amount_billed: formData.value.invoiceAmount,
      master_rep_id: formData.value.masterRepId,
      sub_rep_id: formData.value.subRepId || null,
      sub_sub_rep_id: formData.value.subSubRepId || null,
      status: 'pending',
      expected_collection_date: new Date(formData.value.dateOfService).setDate(
        new Date(formData.value.dateOfService).getDate() + 60
      )
    })
    .select()
    .single()

  if (orderError) {
    console.error('Error creating order:', orderError)
    return
  }

  // Create commission structure
  const { error: commissionError } = await supabase
    .from('commission_structures')
    .insert({
      order_id: order.order_id,
      master_rep_id: formData.value.masterRepId,
      sub_rep_id: formData.value.subRepId || null,
      sub_sub_rep_id: formData.value.subSubRepId || null,
      master_rep_rate: formData.value.masterRepRate,
      sub_rep_rate: formData.value.subRepRate || null,
      sub_sub_rep_rate: formData.value.subSubRepRate || null,
      total_commission: formData.value.invoiceAmount * 0.4 // 40% of invoice amount
    })

  if (commissionError) {
    console.error('Error creating commission structure:', commissionError)
    return
  }

  // Emit success and close modal
  emit('order-added')
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadDoctors(),
    loadProducts(),
    loadReps()
  ])
})
</script> 