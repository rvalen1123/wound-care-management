<template>
  <div class="p-4">
    <Card v-if="order">
      <!-- Header -->
      <template #header>
        <div class="flex justify-between items-center">
          <div>
            <h1 class="text-2xl font-semibold text-gray-800">
              Order #{{ order.id.toString().padStart(4, '0') }}
            </h1>
            <p class="text-sm text-gray-500 mt-1">
              Created on {{ formatDate(order.created_at) }}
            </p>
          </div>
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              label="Edit"
              severity="warning"
              @click="router.push(`/orders/${order.id}/edit`)"
            />
            <Button
              icon="pi pi-arrow-left"
              label="Back to Orders"
              severity="secondary"
              text
              @click="router.push('/orders')"
            />
          </div>
        </div>
      </template>

      <!-- Order Status -->
      <div class="mb-6">
        <Tag
          :severity="getStatusSeverity(order.status)"
          :value="order.status"
          class="text-lg"
        />
      </div>

      <!-- Order Details Grid -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <!-- Doctor Information -->
        <Card class="shadow-sm">
          <template #header>
            <h3 class="text-lg font-medium text-gray-700">Doctor Information</h3>
          </template>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Name:</span>
              <span class="font-medium">{{ order.doctor?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Credit Terms:</span>
              <span>{{ order.doctor?.default_credit_terms }}</span>
            </div>
          </div>
        </Card>

        <!-- Product Information -->
        <Card class="shadow-sm">
          <template #header>
            <h3 class="text-lg font-medium text-gray-700">Product Information</h3>
          </template>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Product:</span>
              <span class="font-medium">{{ order.product?.name }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Manufacturer:</span>
              <span>{{ order.product?.manufacturer }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Size:</span>
              <span>{{ order.size }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Units:</span>
              <span>{{ formatNumber(order.units) }}</span>
            </div>
          </div>
        </Card>

        <!-- Financial Information -->
        <Card class="shadow-sm">
          <template #header>
            <h3 class="text-lg font-medium text-gray-700">Financial Details</h3>
          </template>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">National ASP:</span>
              <span>{{ formatCurrency(order.product?.national_asp || 0) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Invoice Amount:</span>
              <span class="font-medium text-green-600">
                {{ formatCurrency(order.invoice_to_doc) }}
              </span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">MSC Commission:</span>
              <span class="font-medium text-blue-600">
                {{ formatCurrency(order.msc_commission) }}
              </span>
            </div>
          </div>
        </Card>

        <!-- Dates and Status -->
        <Card class="shadow-sm">
          <template #header>
            <h3 class="text-lg font-medium text-gray-700">Timeline</h3>
          </template>
          <div class="space-y-2">
            <div class="flex justify-between">
              <span class="text-gray-600">Service Date:</span>
              <span>{{ formatDate(order.date_of_service) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Expected Collection:</span>
              <span>{{ formatDate(order.expected_collection_date) }}</span>
            </div>
            <div class="flex justify-between">
              <span class="text-gray-600">Last Updated:</span>
              <span>{{ formatDate(order.updated_at) }}</span>
            </div>
          </div>
        </Card>
      </div>

      <!-- Commission Breakdown -->
      <Card class="shadow-sm">
        <template #header>
          <h3 class="text-lg font-medium text-gray-700">Commission Structure</h3>
        </template>
        <OrderCommissionBreakdown
          :commission-amount="order.msc_commission"
          :product="order.product"
        />
      </Card>

      <!-- Approval Section -->
      <Card v-if="order.status === 'pending'" class="shadow-sm mt-6">
        <template #header>
          <h3 class="text-lg font-medium text-gray-700">Order Approval</h3>
        </template>
        <div class="flex items-center justify-between">
          <p class="text-gray-600">
            This order is pending approval. Review the details and approve or reject the order.
          </p>
          <div class="flex gap-2">
            <Button
              icon="pi pi-times"
              label="Reject"
              severity="danger"
              @click="confirmReject"
            />
            <Button
              icon="pi pi-check"
              label="Approve"
              severity="success"
              @click="confirmApprove"
            />
          </div>
        </div>
      </Card>
    </Card>

    <!-- Loading State -->
    <div v-else-if="loading" class="flex justify-center items-center h-64">
      <ProgressSpinner />
      <span class="ml-2">Loading order details...</span>
    </div>

    <!-- Error State -->
    <Card v-else class="bg-red-50">
      <div class="text-center py-8">
        <i class="pi pi-exclamation-triangle text-4xl text-red-500 mb-4"></i>
        <h2 class="text-xl font-medium text-red-700 mb-2">Order Not Found</h2>
        <p class="text-red-600 mb-4">
          The order you're looking for doesn't exist or has been deleted.
        </p>
        <Button
          label="Back to Orders"
          icon="pi pi-arrow-left"
          @click="router.push('/orders')"
        />
      </div>
    </Card>

    <!-- Confirmation Dialogs -->
    <Dialog
      v-model:visible="approveDialogVisible"
      header="Confirm Approval"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-check-circle mr-3 text-green-500" style="font-size: 2rem" />
        <span>Are you sure you want to approve this order?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="approveDialogVisible = false"
        />
        <Button
          label="Yes, Approve"
          icon="pi pi-check"
          severity="success"
          @click="handleApprove"
        />
      </template>
    </Dialog>

    <Dialog
      v-model:visible="rejectDialogVisible"
      header="Confirm Rejection"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex flex-col gap-4">
        <div class="flex align-items-center">
          <i class="pi pi-times-circle mr-3 text-red-500" style="font-size: 2rem" />
          <span>Are you sure you want to reject this order?</span>
        </div>
        <div class="w-full">
          <label class="block text-sm font-medium text-gray-700 mb-1">
            Rejection Reason
          </label>
          <Textarea
            v-model="rejectionReason"
            rows="3"
            placeholder="Please provide a reason for rejection"
            class="w-full"
          />
        </div>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="rejectDialogVisible = false"
        />
        <Button
          label="Yes, Reject"
          icon="pi pi-times"
          severity="danger"
          @click="handleReject"
          :disabled="!rejectionReason"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter, useRoute } from 'vue-router'
import { format } from 'date-fns'
import { useOrderStore } from '@/stores/orderStore'
import type { Order } from '@/types/models'
import { Card } from '@/components/common/ui'
import OrderCommissionBreakdown from './OrderCommissionBreakdown.vue'

const router = useRouter()
const route = useRoute()
const orderStore = useOrderStore()

// State
const loading = ref(true)
const approveDialogVisible = ref(false)
const rejectDialogVisible = ref(false)
const rejectionReason = ref('')

// Computed
const order = computed(() => orderStore.getOrderById(Number(route.params.id)))

// Methods
function getStatusSeverity(status: string): string {
  switch (status) {
    case 'approved':
      return 'success'
    case 'rejected':
      return 'danger'
    default:
      return 'warning'
  }
}

function formatDate(date: string): string {
  return format(new Date(date), 'MMM dd, yyyy')
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value)
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

function confirmApprove() {
  approveDialogVisible.value = true
}

function confirmReject() {
  rejectDialogVisible.value = true
}

async function handleApprove() {
  try {
    await orderStore.updateOrder(Number(route.params.id), {
      status: 'approved',
      approved_at: new Date().toISOString(),
      approved_by: 'current_user_id' // Replace with actual user ID
    })
    approveDialogVisible.value = false
  } catch (error) {
    // Error handling is done in the store
  }
}

async function handleReject() {
  if (!rejectionReason.value) return

  try {
    await orderStore.updateOrder(Number(route.params.id), {
      status: 'rejected',
      rejection_reason: rejectionReason.value,
      rejected_at: new Date().toISOString(),
      rejected_by: 'current_user_id' // Replace with actual user ID
    })
    rejectDialogVisible.value = false
    rejectionReason.value = ''
  } catch (error) {
    // Error handling is done in the store
  }
}

// Lifecycle
onMounted(async () => {
  try {
    await orderStore.fetchOrders()
  } finally {
    loading.value = false
  }
})
</script>
