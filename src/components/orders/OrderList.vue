<template>
  <div class="p-4">
    <Card>
      <!-- Header -->
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-semibold text-gray-800">Order Management</h1>
          <Button 
            icon="pi pi-plus" 
            label="New Order" 
            severity="success" 
            @click="navigateToNewOrder"
          />
        </div>
      </template>

      <!-- Filters -->
      <div class="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
        <div class="flex flex-col">
          <label class="mb-1 text-sm text-gray-600">Doctor</label>
          <Dropdown
            v-model="filters.doctorId"
            :options="doctors"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Doctor"
            class="w-full"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-1 text-sm text-gray-600">Product</label>
          <Dropdown
            v-model="filters.productId"
            :options="products"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Product"
            class="w-full"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-1 text-sm text-gray-600">Status</label>
          <Dropdown
            v-model="filters.status"
            :options="statusOptions"
            placeholder="Select Status"
            class="w-full"
          />
        </div>
        <div class="flex flex-col">
          <label class="mb-1 text-sm text-gray-600">Date Range</label>
          <Calendar
            v-model="dateRange"
            selectionMode="range"
            :showIcon="true"
            class="w-full"
            @date-select="handleDateRangeChange"
          />
        </div>
      </div>

      <!-- Data Table -->
      <DataTable
        :value="filteredOrders"
        :loading="loading"
        :paginator="true"
        :rows="10"
        :rowsPerPageOptions="[10, 20, 50]"
        responsiveLayout="scroll"
        stripedRows
        class="p-datatable-sm"
      >
        <Column field="id" header="Order ID" sortable>
          <template #body="{ data }">
            #{{ data.id.toString().padStart(4, '0') }}
          </template>
        </Column>
        <Column field="doctor.name" header="Doctor" sortable />
        <Column field="product.name" header="Product" sortable />
        <Column field="date_of_service" header="Service Date" sortable>
          <template #body="{ data }">
            {{ formatDate(data.date_of_service) }}
          </template>
        </Column>
        <Column field="units" header="Units" sortable>
          <template #body="{ data }">
            {{ formatNumber(data.units) }}
          </template>
        </Column>
        <Column field="invoice_to_doc" header="Invoice Amount" sortable>
          <template #body="{ data }">
            {{ formatCurrency(data.invoice_to_doc) }}
          </template>
        </Column>
        <Column field="status" header="Status" sortable>
          <template #body="{ data }">
            <Tag :severity="getStatusSeverity(data.status)" :value="data.status" />
          </template>
        </Column>
        <Column field="expected_collection_date" header="Expected Collection" sortable>
          <template #body="{ data }">
            {{ formatDate(data.expected_collection_date) }}
          </template>
        </Column>
        <Column header="Actions" :exportable="false">
          <template #body="{ data }">
            <div class="flex gap-2">
              <Button
                icon="pi pi-eye"
                severity="info"
                text
                rounded
                @click="viewOrder(data)"
                v-tooltip.top="'View Details'"
              />
              <Button
                icon="pi pi-pencil"
                severity="warning"
                text
                rounded
                @click="editOrder(data)"
                v-tooltip.top="'Edit Order'"
              />
              <Button
                icon="pi pi-trash"
                severity="danger"
                text
                rounded
                @click="confirmDelete(data)"
                v-tooltip.top="'Delete Order'"
              />
            </div>
          </template>
        </Column>
      </DataTable>
    </Card>

    <!-- Delete Confirmation Dialog -->
    <Dialog
      v-model:visible="deleteDialogVisible"
      header="Confirm Delete"
      :modal="true"
      :style="{ width: '450px' }"
    >
      <div class="flex align-items-center justify-content-center">
        <i class="pi pi-exclamation-triangle mr-3" style="font-size: 2rem" />
        <span>Are you sure you want to delete this order?</span>
      </div>
      <template #footer>
        <Button
          label="No"
          icon="pi pi-times"
          text
          @click="deleteDialogVisible = false"
        />
        <Button
          label="Yes"
          icon="pi pi-check"
          severity="danger"
          @click="handleDelete"
        />
      </template>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { format } from 'date-fns'
import { useOrderStore } from '@/stores/orderStore'
import { useDoctorStore } from '@/stores/doctorStore'
import { useProductStore } from '@/stores/productStore'
import type { Order, OrderFilters } from '@/types/models'
import { Card } from '@/components/common/ui'

// Store initialization
const orderStore = useOrderStore()
const doctorStore = useDoctorStore()
const productStore = useProductStore()
const router = useRouter()

// State
const deleteDialogVisible = ref(false)
const orderToDelete = ref<Order | null>(null)
const dateRange = ref<Date[]>([])
const filters = ref<OrderFilters>({
  doctorId: undefined,
  productId: undefined,
  status: undefined,
  dateFrom: undefined,
  dateTo: undefined
})

// Computed
const loading = computed(() => orderStore.loading)
const doctors = computed(() => doctorStore.doctors)
const products = computed(() => productStore.products)
const filteredOrders = computed(() => orderStore.filteredOrders(filters.value))

const statusOptions = [
  { label: 'Pending', value: 'pending' },
  { label: 'Approved', value: 'approved' },
  { label: 'Rejected', value: 'rejected' }
]

// Methods
function navigateToNewOrder() {
  router.push('/orders/new')
}

function viewOrder(order: Order) {
  router.push(`/orders/${order.id}`)
}

function editOrder(order: Order) {
  router.push(`/orders/${order.id}/edit`)
}

function confirmDelete(order: Order) {
  orderToDelete.value = order
  deleteDialogVisible.value = true
}

async function handleDelete() {
  if (!orderToDelete.value) return
  
  try {
    await orderStore.deleteOrder(orderToDelete.value.id)
    deleteDialogVisible.value = false
    orderToDelete.value = null
  } catch (error) {
    // Toast notification will be handled by the store
  }
}

function handleDateRangeChange() {
  if (dateRange.value?.length === 2) {
    filters.value.dateFrom = dateRange.value[0].toISOString().split('T')[0]
    filters.value.dateTo = dateRange.value[1].toISOString().split('T')[0]
  } else {
    filters.value.dateFrom = undefined
    filters.value.dateTo = undefined
  }
}

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

// Formatters
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

// Lifecycle
onMounted(async () => {
  await Promise.all([
    orderStore.fetchOrders(),
    doctorStore.fetchDoctors(),
    productStore.fetchProducts()
  ])
})
</script>
