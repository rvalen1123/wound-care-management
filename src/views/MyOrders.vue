<template>
  <div class="my-orders">
    <vx-card>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="h3 mb-0">My Orders</h1>
          <div>
            <vx-button
              variant="outline-secondary"
              class="me-2"
              @click="exportOrders"
            >
              Export
            </vx-button>
            <vx-select
              v-model="selectedDoctor"
              :options="doctorOptions"
              placeholder="Filter by Doctor"
              class="d-inline-block"
              style="width: 200px"
            />
          </div>
        </div>
      </template>

      <vx-table
        :items="filteredOrders"
        :fields="orderFields"
        responsive
        hover
      >
        <template #cell(dateOfService)="{ value }">
          {{ formatDate(value) }}
        </template>
        
        <template #cell(invoiceAmount)="{ value }">
          ${{ formatNumber(value) }}
        </template>
        
        <template #cell(repCommission)="{ value }">
          ${{ formatNumber(value) }}
        </template>
        
        <template #cell(status)="{ item }">
          <vx-badge :variant="getStatusVariant(item)">
            {{ getStatusText(item) }}
          </vx-badge>
        </template>
        
        <template #cell(actions)="{ item }">
          <vx-button
            size="sm"
            variant="outline-primary"
            @click="viewOrderDetails(item)"
          >
            View
          </vx-button>
        </template>
      </vx-table>
    </vx-card>

    <!-- Order Details Modal -->
    <vx-modal
      v-if="selectedOrder"
      v-model="showDetailsModal"
      title="Order Details"
      size="lg"
    >
      <div class="row">
        <div class="col-md-6">
          <dl>
            <dt>Order Number</dt>
            <dd>{{ selectedOrder.orderNumber }}</dd>

            <dt>Date of Service</dt>
            <dd>{{ formatDate(selectedOrder.dateOfService) }}</dd>

            <dt>Doctor</dt>
            <dd>{{ selectedOrder.doctor?.name }}</dd>

            <dt>Patient ID</dt>
            <dd>{{ selectedOrder.patientId }}</dd>
          </dl>
        </div>

        <div class="col-md-6">
          <dl>
            <dt>Graph Type</dt>
            <dd>{{ selectedOrder.graphType }}</dd>

            <dt>Units</dt>
            <dd>{{ selectedOrder.units }}</dd>

            <dt>Q Code</dt>
            <dd>{{ selectedOrder.qCode }}</dd>

            <dt>Credit Terms</dt>
            <dd>{{ selectedOrder.creditTerms }}</dd>
          </dl>
        </div>
      </div>

      <div class="row mt-4">
        <div class="col-md-6">
          <dl>
            <dt>Invoice Amount</dt>
            <dd>${{ formatNumber(selectedOrder.invoiceAmount) }}</dd>

            <dt>Primary Medicare (80%)</dt>
            <dd>${{ formatNumber(selectedOrder.primaryMedicare) }}</dd>

            <dt>Secondary</dt>
            <dd>{{ selectedOrder.secondary ? `$${formatNumber(selectedOrder.secondary)}` : 'N/A' }}</dd>
          </dl>
        </div>

        <div class="col-md-6">
          <dl>
            <dt>Manufacturer Discount</dt>
            <dd>${{ formatNumber(selectedOrder.manufacturerDiscount) }}</dd>

            <dt>Rep Commission</dt>
            <dd>${{ formatNumber(selectedOrder.repCommission) }}</dd>

            <dt>Commission Paid Date</dt>
            <dd>{{ selectedOrder.repPaidDate ? formatDate(selectedOrder.repPaidDate) : 'Pending' }}</dd>
          </dl>
        </div>
      </div>

      <div class="mt-4">
        <dt>Notes</dt>
        <dd>{{ selectedOrder.notes || 'No notes' }}</dd>
      </div>
    </vx-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { format } from 'date-fns';
import { Order } from '@/models/Order';
import { Doctor } from '@/models/Doctor';
import { supabase } from '@/config/supabase';

const orders = ref<Order[]>([]);
const doctors = ref<Doctor[]>([]);
const selectedDoctor = ref<string | null>(null);
const selectedOrder = ref<Order | null>(null);
const showDetailsModal = ref(false);

const orderFields = [
  { key: 'orderNumber', label: 'Order #' },
  { key: 'dateOfService', label: 'Date of Service' },
  { key: 'doctor.name', label: 'Doctor' },
  { key: 'graphType', label: 'Graph Type' },
  { key: 'invoiceAmount', label: 'Amount' },
  { key: 'repCommission', label: 'Commission' },
  { key: 'status', label: 'Status' },
  { key: 'actions', label: '' }
];

const doctorOptions = computed(() => {
  return doctors.value.map(doctor => ({
    value: doctor.id,
    label: doctor.name
  }));
});

const filteredOrders = computed(() => {
  if (!selectedDoctor.value) return orders.value;
  return orders.value.filter(order => order.doctorId === selectedDoctor.value);
});

onMounted(async () => {
  await Promise.all([
    fetchOrders(),
    fetchDoctors()
  ]);
});

async function fetchOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        doctor:doctorId (
          id,
          name
        )
      `)
      .eq('repId', localStorage.getItem('userId'));

    if (error) throw error;
    orders.value = data;
  } catch (error) {
    console.error('Failed to fetch orders:', error);
  }
}

async function fetchDoctors() {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('repId', localStorage.getItem('userId'));

    if (error) throw error;
    doctors.value = data;
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
  }
}

function formatDate(date: string | Date): string {
  return format(new Date(date), 'MMM d, yyyy');
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

function getStatusVariant(order: Order): string {
  if (order.repPaidDate) return 'success';
  if (order.manufacturerPaidDate) return 'warning';
  return 'info';
}

function getStatusText(order: Order): string {
  if (order.repPaidDate) return 'Completed';
  if (order.manufacturerPaidDate) return 'Processing';
  return 'Active';
}

function viewOrderDetails(order: Order) {
  selectedOrder.value = order;
  showDetailsModal.value = true;
}

async function exportOrders() {
  try {
    const ordersToExport = filteredOrders.value.map(order => ({
      'Order #': order.orderNumber,
      'Date of Service': formatDate(order.dateOfService),
      'Doctor': order.doctor?.name,
      'Graph Type': order.graphType,
      'Units': order.units,
      'Invoice Amount': formatNumber(order.invoiceAmount),
      'Commission': formatNumber(order.repCommission),
      'Status': getStatusText(order)
    }));

    const csv = Papa.unparse(ordersToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `orders-${format(new Date(), 'yyyy-MM-dd')}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  } catch (error) {
    console.error('Failed to export orders:', error);
  }
}
</script>

<style lang="scss" scoped>
.my-orders {
  dt {
    font-weight: 600;
    margin-bottom: 0.25rem;
  }

  dd {
    margin-bottom: 1rem;
  }
}
</style>
