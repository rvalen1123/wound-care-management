<template>
  <div class="p-6">
    <h1 class="text-2xl font-bold mb-6">Rep Dashboard</h1>
    
    <!-- Overview Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900">Total Commission YTD</h3>
        <p class="mt-2 text-3xl font-semibold text-green-600">
          {{ formatCurrency(ytdCommission) }}
        </p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900">Orders This Month</h3>
        <p class="mt-2 text-3xl font-semibold text-blue-600">
          {{ monthlyOrders }}
        </p>
        <p class="mt-2 text-sm text-gray-500">
          {{ formatCurrency(monthlyCommission) }} in commissions
        </p>
      </div>

      <div class="bg-white rounded-lg shadow p-6">
        <h3 class="text-lg font-medium text-gray-900">Commission Rate</h3>
        <p class="mt-2 text-3xl font-semibold text-indigo-600">
          {{ baseCommissionRate }}%
        </p>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-white rounded-lg shadow mb-8">
      <div class="p-6">
        <div class="flex justify-between items-center mb-4">
          <h3 class="text-lg font-medium text-gray-900">Recent Orders</h3>
          <Button 
            label="Export" 
            icon="pi pi-download"
            @click="exportCommissionReport('excel')" 
          />
        </div>
        <DataTable 
          :value="recentOrders" 
          :paginator="true" 
          :rows="5"
          stripedRows
          class="p-datatable-sm"
        >
          <Column field="date_of_service" header="Date">
            <template #body="{ data }">
              {{ formatDate(data.date_of_service) }}
            </template>
          </Column>
          <Column field="doctor.name" header="Doctor" />
          <Column field="product.name" header="Product" />
          <Column field="commission_amount" header="Commission">
            <template #body="{ data }">
              {{ formatCurrency(data.commission_amount) }}
            </template>
          </Column>
          <Column field="status" header="Status">
            <template #body="{ data }">
              <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
            </template>
          </Column>
        </DataTable>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useRepStore } from '@/stores/repStore';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Tag from 'primevue/tag';
import { format } from 'date-fns';
import { exportToExcel } from '@/utils/exportUtils';

interface Order {
  date_of_service: string;
  doctor: {
    name: string;
  };
  product: {
    name: string;
  };
  commission_amount: number;
  status: string;
}

interface ExportColumn {
  header: string;
  field: string;
  format?: 'number' | 'date' | 'currency';
}

const router = useRouter();
const repStore = useRepStore();

// State
const recentOrders = ref<Order[]>([]);
const ytdCommission = ref(0);
const monthlyOrders = ref(0);
const monthlyCommission = ref(0);
const baseCommissionRate = ref(0);

// Methods
function getStatusSeverity(status: string): string {
  switch (status.toLowerCase()) {
    case 'completed':
      return 'success';
    case 'pending':
      return 'warning';
    case 'cancelled':
      return 'danger';
    default:
      return 'info';
  }
}

async function loadDashboardData() {
  try {
    await repStore.fetchRepCommissions();
    await repStore.fetchRecentOrders();
    
    recentOrders.value = repStore.getRecentOrders();
    ytdCommission.value = repStore.getYTDCommission();
    monthlyOrders.value = repStore.getCurrentMonthOrders();
    monthlyCommission.value = repStore.getCurrentMonthCommission();
    baseCommissionRate.value = repStore.getCurrentRepProfile()?.default_commission_rate || 0;
  } catch (error) {
    console.error('Error loading dashboard data:', error);
  }
}

async function exportCommissionReport(type: 'excel') {
  try {
    // Get the date range for the current month
    const now = new Date();
    const startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
    const endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString();
    
    const data = await repStore.generateCommissionReport(startDate, endDate);
    const columns: ExportColumn[] = [
      { header: 'Date', field: 'date_of_service', format: 'date' },
      { header: 'Doctor', field: 'doctor.name' },
      { header: 'Product', field: 'product.name' },
      { header: 'Commission', field: 'commission_amount', format: 'currency' }
    ];
    
    if (type === 'excel') {
      await exportToExcel({
        title: 'Commission Report',
        data,
        columns
      });
    }
  } catch (error) {
    console.error('Error exporting report:', error);
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value);
}

function formatDate(date: string): string {
  return format(new Date(date), 'MMM dd, yyyy');
}

// Load initial data
onMounted(loadDashboardData);
</script>
