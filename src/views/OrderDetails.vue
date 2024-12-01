<template>
  <div class="order-details p-6 bg-gray-50">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">
        Order Details #{{ order.id }}
      </h1>
      <div v-if="isAdmin" class="flex gap-2">
        <PrimeButton
          icon="pi pi-pencil"
          label="Edit"
          class="p-button-warning"
          @click="showEditDialog = true"
        />
        <PrimeButton
          icon="pi pi-trash"
          label="Delete"
          class="p-button-danger"
          @click="confirmDelete"
        />
      </div>
    </div>

    <div class="mb-6 flex justify-between items-center">
      <h1 class="text-2xl font-bold text-green-700">Order Details</h1>
      <router-link to="/" class="p-button p-button-outlined p-button-secondary">
        Back to Dashboard
      </router-link>
    </div>

    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <!-- Order Summary Card -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Order Summary</h2>
        <div class="space-y-4">
          <div class="flex justify-between">
            <span class="text-gray-600">Order #:</span>
            <span class="font-medium">#{{ order.id }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Status:</span>
            <PrimeTag :value="order.status" 
                 :severity="getStatusSeverity(order.status)"
                 class="text-sm" />
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Date of Service:</span>
            <span>{{ order.dateOfService }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Credit Terms:</span>
            <span>{{ order.creditTerms }}</span>
          </div>
          <div class="flex justify-between">
            <span class="text-gray-600">Expected Collection:</span>
            <span>{{ order.expectedCollectionDate }}</span>
          </div>
        </div>
      </div>

      <!-- Patient Information -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Patient Information</h2>
        <div class="space-y-4">
          <div>
            <label class="text-gray-600 block">Patient ID (Deidentified)</label>
            <span class="font-medium">{{ order.patientDeidentified }}</span>
          </div>
          <div>
            <label class="text-gray-600 block">Facility</label>
            <span>{{ order.customerName }}</span>
          </div>
          <div>
            <label class="text-gray-600 block">Type of Graft</label>
            <span>{{ order.typeOfGraft }}</span>
          </div>
        </div>
      </div>

      <!-- Financial Summary -->
      <div class="bg-white p-6 rounded-lg shadow-md">
        <h2 class="text-xl font-semibold mb-4">Financial Summary</h2>
        <div class="space-y-4">
          <div>
            <label class="text-gray-600 block">Invoice Amount (Medicare)</label>
            <span class="font-medium">${{ formatNumber(order.invoiceAmountMedicare) }}</span>
          </div>
          <div>
            <label class="text-gray-600 block">Primary Medicare (80%)</label>
            <span>${{ formatNumber(order.primaryMedicare) }}</span>
          </div>
          <div>
            <label class="text-gray-600 block">Secondary</label>
            <span>${{ formatNumber(order.secondary) }}</span>
          </div>
          <div>
            <label class="text-gray-600 block">Discounted Invoice (40%)</label>
            <span>${{ formatNumber(order.discountedInvoice) }}</span>
          </div>
        </div>
      </div>
    </div>

    <!-- Product Details -->
    <div class="mt-6 bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Product Details</h2>
      <DataTable :value="[order.productDetails]" class="p-datatable-sm">
        <PrimeColumn field="product" header="Product"></PrimeColumn>
        <PrimeColumn field="qCode" header="Q Code"></PrimeColumn>
        <PrimeColumn field="units" header="Units">
          <template #body="slotProps">
            {{ slotProps.data.units }}
          </template>
        </PrimeColumn>
        <PrimeColumn field="pricePerUnit" header="Price/Unit">
          <template #body="slotProps">
            ${{ formatNumber(slotProps.data.pricePerUnit) }}
          </template>
        </PrimeColumn>
        <PrimeColumn field="totalPrice" header="Total">
          <template #body="slotProps">
            ${{ formatNumber(slotProps.data.pricePerUnit * slotProps.data.units) }}
          </template>
        </PrimeColumn>
      </DataTable>
    </div>

    <!-- Payment Details -->
    <div class="mt-6 bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Payment Details</h2>
      <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <!-- Manufacturer Payment -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Manufacturer Payment</h3>
          <div class="space-y-3">
            <div>
              <label class="text-gray-600 block">Paid to Manufacturer/MSC</label>
              <span>${{ formatNumber(order.paidToManufacturer) }}</span>
            </div>
            <div>
              <label class="text-gray-600 block">Payment Date</label>
              <span>{{ order.manufacturerPaidDate || 'Pending' }}</span>
            </div>
            <div>
              <label class="text-gray-600 block">Running Balance</label>
              <span>${{ formatNumber(order.runningBalanceManufacturer) }}</span>
            </div>
            <div>
              <label class="text-gray-600 block">Notes</label>
              <p class="text-sm">{{ order.manufacturerPaymentNotes || 'No notes' }}</p>
            </div>
          </div>
        </div>

        <!-- Commission Details -->
        <div>
          <h3 class="text-lg font-semibold mb-3">Commission Details</h3>
          <div class="space-y-3">
            <div>
              <label class="text-gray-600 block">MSC Commission</label>
              <span>${{ formatNumber(order.mscCommission) }}</span>
            </div>
            <div>
              <label class="text-gray-600 block">MSC Paid Date</label>
              <span>{{ order.mscPaidDate || 'Pending' }}</span>
            </div>
            <div>
              <label class="text-gray-600 block">Rep Commission</label>
              <span>${{ formatNumber(order.repCommission) }}</span>
            </div>
            <div>
              <label class="text-gray-600 block">Rep Paid Date</label>
              <span>{{ order.repPaidDate || 'Pending' }}</span>
            </div>
            <div>
              <label class="text-gray-600 block">Rep Payment Notes</label>
              <p class="text-sm">{{ order.repPaymentNotes || 'No notes' }}</p>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Action Buttons -->
    <div class="mt-6 flex gap-4">
      <PrimeButton label="Download Invoice" 
              icon="pi pi-file-pdf" 
              class="p-button-primary" 
              @click="downloadInvoice" />
      <PrimeButton label="Print Order Details" 
              icon="pi pi-print" 
              class="p-button-secondary" 
              @click="printOrder" />
    </div>

    <!-- Edit Dialog -->
    <PrimeDialog
      v-model:visible="showEditDialog"
      header="Edit Order"
      :modal="true"
      class="p-fluid"
    >
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="field">
          <label for="patientId">Patient ID</label>
          <InputText
            id="patientId"
            v-model="editedOrder.patientDeidentified"
            required
          />
        </div>
        <div class="field">
          <label for="dateOfService">Date of Service</label>
          <PrimeCalendar
            id="dateOfService"
            v-model="editedOrder.dateOfService"
            dateFormat="mm/dd/yy"
            required
          />
        </div>
        <div class="field">
          <label for="typeOfGraft">Type of Graft</label>
          <PrimeDropdown
            id="typeOfGraft"
            v-model="editedOrder.typeOfGraft"
            :options="graftTypes"
            optionLabel="name"
            required
          />
        </div>
        <div class="field">
          <label for="units">Units</label>
          <InputNumber
            id="units"
            v-model="editedOrder.units"
            required
          />
        </div>
        <div class="field">
          <label for="invoiceAmount">Invoice Amount</label>
          <InputNumber
            id="invoiceAmount"
            v-model="editedOrder.invoiceAmount"
            mode="currency"
            currency="USD"
            required
          />
        </div>
        <div class="field">
          <label for="status">Status</label>
          <PrimeDropdown
            id="status"
            v-model="editedOrder.status"
            :options="orderStatuses"
            optionLabel="name"
            required
          />
        </div>
      </div>
      <template #footer>
        <PrimeButton
          label="Cancel"
          icon="pi pi-times"
          class="p-button-text"
          @click="showEditDialog = false"
        />
        <PrimeButton
          label="Save"
          icon="pi pi-check"
          class="p-button-success"
          @click="saveOrder"
        />
      </template>
    </PrimeDialog>

    <!-- Delete Confirmation Dialog -->
    <ConfirmDialog></ConfirmDialog>

    <!-- Add Commission Breakdown section -->
    <div class="mt-6 bg-white p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Commission Breakdown</h2>
        <div v-if="isAdmin" class="flex items-center gap-2">
          <button
            @click="showEditCommissionDialog = true"
            class="text-blue-600 hover:text-blue-800"
          >
            Edit Commission Structure
          </button>
        </div>
      </div>

      <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <!-- Master Rep Commission -->
        <div v-if="order.master_rep_id" class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium">Master Rep</h3>
            <span class="text-sm text-gray-500">{{ order.master_rep?.rep_name }}</span>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Rate:</span>
              <span class="font-medium">{{ order.master_rep_rate }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Amount:</span>
              <span class="font-medium">${{ formatNumber(commissionAmounts.masterRep) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Status:</span>
              <PrimeTag 
                :value="order.master_rep_paid_date ? 'Paid' : 'Pending'" 
                :severity="order.master_rep_paid_date ? 'success' : 'warning'"
              />
            </div>
            <div v-if="order.master_rep_paid_date" class="flex justify-between">
              <span class="text-sm text-gray-600">Paid Date:</span>
              <span>{{ formatDate(order.master_rep_paid_date) }}</span>
            </div>
          </div>
        </div>

        <!-- Sub Rep Commission -->
        <div v-if="order.sub_rep_id" class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium">Sub Rep</h3>
            <span class="text-sm text-gray-500">{{ order.sub_rep?.rep_name }}</span>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Rate:</span>
              <span class="font-medium">{{ order.sub_rep_rate }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Amount:</span>
              <span class="font-medium">${{ formatNumber(commissionAmounts.subRep) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Status:</span>
              <PrimeTag 
                :value="order.sub_rep_paid_date ? 'Paid' : 'Pending'" 
                :severity="order.sub_rep_paid_date ? 'success' : 'warning'"
              />
            </div>
            <div v-if="order.sub_rep_paid_date" class="flex justify-between">
              <span class="text-sm text-gray-600">Paid Date:</span>
              <span>{{ formatDate(order.sub_rep_paid_date) }}</span>
            </div>
          </div>
        </div>

        <!-- Sub-Sub Rep Commission -->
        <div v-if="order.sub_sub_rep_id" class="bg-gray-50 p-4 rounded-lg">
          <div class="flex justify-between items-center mb-2">
            <h3 class="font-medium">Sub-Sub Rep</h3>
            <span class="text-sm text-gray-500">{{ order.sub_sub_rep?.rep_name }}</span>
          </div>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Rate:</span>
              <span class="font-medium">{{ order.sub_sub_rep_rate }}%</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Amount:</span>
              <span class="font-medium">${{ formatNumber(commissionAmounts.subSubRep) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-sm text-gray-600">Status:</span>
              <PrimeTag 
                :value="order.sub_sub_rep_paid_date ? 'Paid' : 'Pending'" 
                :severity="order.sub_sub_rep_paid_date ? 'success' : 'warning'"
              />
            </div>
            <div v-if="order.sub_sub_rep_paid_date" class="flex justify-between">
              <span class="text-sm text-gray-600">Paid Date:</span>
              <span>{{ formatDate(order.sub_sub_rep_paid_date) }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- Commission Summary -->
      <div class="mt-4 p-4 bg-gray-50 rounded-lg">
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div>
            <span class="text-sm text-gray-600">Total Commission:</span>
            <p class="text-lg font-semibold">${{ formatNumber(totalCommissionAmount) }}</p>
          </div>
          <div>
            <span class="text-sm text-gray-600">Total Rate:</span>
            <p class="text-lg font-semibold">{{ totalCommissionRate }}%</p>
          </div>
          <div>
            <span class="text-sm text-gray-600">Paid Amount:</span>
            <p class="text-lg font-semibold">${{ formatNumber(totalPaidAmount) }}</p>
          </div>
          <div>
            <span class="text-sm text-gray-600">Remaining:</span>
            <p class="text-lg font-semibold">${{ formatNumber(remainingAmount) }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- Payment History -->
    <div class="mt-6 bg-white p-6 rounded-lg shadow-md">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Payment History</h2>
        <div v-if="isAdmin" class="flex items-center gap-2">
          <button
            @click="showAddPaymentDialog = true"
            class="text-blue-600 hover:text-blue-800"
          >
            Record Payment
          </button>
        </div>
      </div>

      <DataTable :value="paymentHistory" class="p-datatable-sm">
        <Column field="payment_date" header="Date">
          <template #body="{ data }">
            {{ formatDate(data.payment_date) }}
          </template>
        </Column>
        <Column field="amount" header="Amount">
          <template #body="{ data }">
            ${{ formatNumber(data.amount) }}
          </template>
        </Column>
        <Column field="recipient_type" header="Recipient" />
        <Column field="recipient_name" header="Name" />
        <Column field="status" header="Status">
          <template #body="{ data }">
            <PrimeTag :value="data.status" :severity="getPaymentStatusSeverity(data.status)" />
          </template>
        </Column>
        <Column field="notes" header="Notes" />
      </DataTable>
    </div>

    <!-- Audit Log -->
    <div class="mt-6 bg-white p-6 rounded-lg shadow-md">
      <h2 class="text-xl font-semibold mb-4">Audit Log</h2>
      <CommissionAuditLog :structureId="order.commission_structure_id" />
    </div>

    <!-- Edit Commission Dialog -->
    <Dialog
      v-model:visible="showEditCommissionDialog"
      header="Edit Commission Structure"
      :modal="true"
      class="p-fluid"
    >
      <div class="space-y-4">
        <!-- Master Rep -->
        <div class="form-group">
          <label>Master Rep Rate (%)</label>
          <InputNumber 
            v-model="editedCommission.masterRepRate"
            :min="0"
            :max="100"
            @change="validateEditedRates"
          />
        </div>

        <!-- Sub Rep -->
        <div class="form-group">
          <label>Sub Rep Rate (%)</label>
          <InputNumber 
            v-model="editedCommission.subRepRate"
            :min="0"
            :max="100"
            :disabled="!order.sub_rep_id"
            @change="validateEditedRates"
          />
        </div>

        <!-- Sub-Sub Rep -->
        <div class="form-group">
          <label>Sub-Sub Rep Rate (%)</label>
          <InputNumber 
            v-model="editedCommission.subSubRepRate"
            :min="0"
            :max="100"
            :disabled="!order.sub_sub_rep_id"
            @change="validateEditedRates"
          />
        </div>

        <div class="text-sm" :class="editedTotalRate > 100 ? 'text-red-600' : 'text-green-600'">
          Total Rate: {{ editedTotalRate }}%
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="showEditCommissionDialog = false"
          class="p-button-text"
        />
        <Button
          label="Save"
          icon="pi pi-check"
          @click="saveCommissionChanges"
          :disabled="editedTotalRate > 100"
        />
      </template>
    </Dialog>

    <!-- Add Payment Dialog -->
    <Dialog
      v-model:visible="showAddPaymentDialog"
      header="Record Payment"
      :modal="true"
      class="p-fluid"
    >
      <div class="space-y-4">
        <div class="form-group">
          <label>Recipient</label>
          <Dropdown
            v-model="newPayment.recipientType"
            :options="availableRecipients"
            optionLabel="name"
            optionValue="type"
            placeholder="Select Recipient"
          />
        </div>

        <div class="form-group">
          <label>Amount</label>
          <InputNumber
            v-model="newPayment.amount"
            mode="currency"
            currency="USD"
            :max="getMaxPaymentAmount()"
          />
        </div>

        <div class="form-group">
          <label>Payment Date</label>
          <Calendar v-model="newPayment.paymentDate" />
        </div>

        <div class="form-group">
          <label>Notes</label>
          <Textarea v-model="newPayment.notes" rows="3" />
        </div>
      </div>

      <template #footer>
        <Button
          label="Cancel"
          icon="pi pi-times"
          @click="showAddPaymentDialog = false"
          class="p-button-text"
        />
        <Button
          label="Save"
          icon="pi pi-check"
          @click="savePayment"
          :disabled="!isValidPayment"
        />
      </template>
    </Dialog>
  </div>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import { useRoute, useRouter } from 'vue-router'
import { useAuth } from '@/services/auth.service'
import { confirmDialog } from 'primevue/confirmdialog'
import { useSupabase } from '@/composables/useSupabase'
import { useCommission } from '@/composables/useCommission'
import CommissionAuditLog from '@/components/commission/CommissionAuditLog.vue'

export default {
  name: 'OrderDetails',
  setup() {
    const route = useRoute()
    const router = useRouter()
    const { isAdmin } = useAuth()
    const orderId = ref(route.params.id)
    const showEditDialog = ref(false)
    const editedOrder = ref({})

    const graftTypes = [
      { name: 'Dermal Matrix' },
      { name: 'Amniotic Membrane' },
      { name: 'Skin Graft' }
    ]

    const orderStatuses = [
      { name: 'invoice sent' },
      { name: 'invoice paid' },
      { name: 'delinquent' }
    ]

    const confirmDelete = () => {
      confirmDialog({
        message: 'Are you sure you want to delete this order?',
        header: 'Delete Confirmation',
        icon: 'pi pi-exclamation-triangle',
        accept: () => deleteOrder(),
        reject: () => null
      })
    }

    const deleteOrder = async () => {
      try {
        // TODO: Implement actual delete API call
        console.log('Deleting order:', orderId.value)
        // After successful deletion
        router.push('/dashboard')
      } catch (error) {
        console.error('Delete Error:', error)
      }
    }

    const saveOrder = async () => {
      try {
        // TODO: Implement actual save API call
        console.log('Saving order:', editedOrder.value)
        showEditDialog.value = false
        // Refresh order details after save
        loadOrderDetails()
      } catch (error) {
        console.error('Save Error:', error)
      }
    }

    const loadOrderDetails = async () => {
      try {
        // TODO: Implement actual API call
        // For now, using mock data
        editedOrder.value = {
          patientDeidentified: 'PT-2024-001',
          dateOfService: new Date(),
          typeOfGraft: graftTypes[0],
          units: 2,
          invoiceAmount: 2500.00,
          status: orderStatuses[0]
        }
      } catch (error) {
        console.error('Load Error:', error)
      }
    }

    onMounted(() => {
      loadOrderDetails()
    })

    return {
      orderId,
      isAdmin,
      showEditDialog,
      editedOrder,
      graftTypes,
      orderStatuses,
      confirmDelete,
      saveOrder
    }
  },
  data() {
    return {
      order: {
        id: '1001',
        status: 'invoice sent',
        dateOfService: '2024-01-15',
        creditTerms: 'Net 30',
        expectedCollectionDate: '2024-02-15',
        patientDeidentified: 'PT-2024-001',
        customerName: 'City Hospital',
        typeOfGraft: 'Skin Graft',
        invoiceAmountMedicare: 5000.00,
        primaryMedicare: 4000.00,
        secondary: 1000.00,
        discountedInvoice: 3000.00,
        productDetails: {
          product: 'Palingen X Plus',
          qCode: 'Q4173',
          units: 20,
          pricePerUnit: 206.10
        },
        paidToManufacturer: 2500.00,
        manufacturerPaidDate: '2024-01-20',
        runningBalanceManufacturer: 500.00,
        manufacturerPaymentNotes: 'Partial payment received',
        mscCommission: 300.00,
        mscPaidDate: '2024-01-21',
        repCommission: 150.00,
        repPaidDate: '2024-01-22',
        repPaymentNotes: 'Commission paid in full'
      }
    }
  },
  methods: {
    formatNumber(value) {
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    getStatusSeverity(status) {
      const severities = {
        'invoice paid': 'success',
        'invoice sent': 'warning',
        'delinquent': 'danger'
      }
      return severities[status] || 'info'
    },
    downloadInvoice() {
      // TODO: Implement invoice download
      console.log('Downloading invoice...')
    },
    printOrder() {
      window.print()
    }
  },
  created() {
    // TODO: Fetch order details using route param
    const orderId = this.$route.params.id
    console.log('Fetching order:', orderId)
  }
}
</script>

<style scoped>
@media print {
  .order-details {
    background-color: white;
    padding: 20px;
  }
  
  .p-button {
    display: none;
  }
}
</style>
