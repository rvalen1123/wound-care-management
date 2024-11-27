<template>
  <div class="analytics">
    <vx-card>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="h3 mb-0">Analytics Dashboard</h1>
          <div>
            <vx-button
              variant="outline-secondary"
              class="me-2"
              @click="exportAnalytics"
            >
              Export Data
            </vx-button>
            <vx-datepicker
              v-model="dateRange"
              range
              class="d-inline-block"
              @change="fetchAnalytics"
            />
          </div>
        </div>
      </template>

      <!-- Key Metrics -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <vx-card class="stats-card">
            <h3 class="h6 mb-2">Total Revenue</h3>
            <div class="h4 mb-0">${{ formatNumber(analytics.totalSalesRevenue) }}</div>
          </vx-card>
        </div>

        <div class="col-md-3">
          <vx-card class="stats-card">
            <h3 class="h6 mb-2">Outstanding Balance</h3>
            <div class="h4 mb-0">${{ formatNumber(analytics.totalAccountsReceivable) }}</div>
          </vx-card>
        </div>

        <div class="col-md-3">
          <vx-card class="stats-card">
            <h3 class="h6 mb-2">Payables</h3>
            <div class="h4 mb-0">${{ formatNumber(analytics.totalManufacturerPayables) }}</div>
          </vx-card>
        </div>

        <div class="col-md-3">
          <vx-card class="stats-card">
            <h3 class="h6 mb-2">Commission Payables</h3>
            <div class="h4 mb-0">${{ formatNumber(analytics.totalCommissionPayables) }}</div>
          </vx-card>
        </div>
      </div>

      <!-- Charts -->
      <div class="row g-4">
        <div class="col-md-6">
          <vx-card>
            <template #header>
              <h3 class="h5 mb-0">Order Value Trends</h3>
            </template>
            <vx-chart
              type="line"
              :data="orderValueChartData"
              :options="lineChartOptions"
            />
          </vx-card>
        </div>

        <div class="col-md-6">
          <vx-card>
            <template #header>
              <h3 class="h5 mb-0">Payment Cycle Trends</h3>
            </template>
            <vx-chart
              type="line"
              :data="paymentCycleChartData"
              :options="lineChartOptions"
            />
          </vx-card>
        </div>
      </div>

      <!-- Product Performance -->
      <vx-card class="mt-4">
        <template #header>
          <h3 class="h5 mb-0">Product Performance</h3>
        </template>

        <vx-table
          :items="analytics.productPerformance"
          :fields="productFields"
          responsive
          hover
        >
          <template #cell(revenue)="{ value }">
            ${{ formatNumber(value) }}
          </template>
          <template #cell(turnoverRate)="{ value }">
            {{ formatNumber(value) }} units/month
          </template>
        </vx-table>
      </vx-card>

      <!-- Outstanding Balances -->
      <vx-card class="mt-4">
        <template #header>
          <h3 class="h5 mb-0">Outstanding Balances by Doctor</h3>
        </template>

        <vx-table
          :items="analytics.outstandingBalances"
          :fields="balanceFields"
          responsive
          hover
        >
          <template #cell(amount)="{ value }">
            ${{ formatNumber(value) }}
          </template>
        </vx-table>
      </vx-card>
    </vx-card>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { format } from 'date-fns';
import { OrderAnalytics } from '@/models/analytics/OrderAnalytics';
import { supabase } from '@/config/supabase';

const analytics = ref<OrderAnalytics>({
  totalSalesRevenue: 0,
  outstandingBalances: [],
  totalAccountsReceivable: 0,
  manufacturerPayables: [],
  totalManufacturerPayables: 0,
  commissionPayables: [],
  totalCommissionPayables: 0,
  paymentMetrics: {
    averageDaysToPayment: 0,
    paymentTrends: []
  },
  averageOrderValue: 0,
  orderValueTrends: [],
  productPerformance: []
});

const dateRange = ref<[Date, Date] | null>(null);

const productFields = [
  { key: 'productName', label: 'Product' },
  { key: 'unitsSold', label: 'Units Sold' },
  { key: 'revenue', label: 'Revenue' },
  { key: 'turnoverRate', label: 'Monthly Turnover' }
];

const balanceFields = [
  { key: 'doctorName', label: 'Doctor' },
  { key: 'amount', label: 'Outstanding Amount' }
];

const lineChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true
    }
  }
};

const orderValueChartData = computed(() => ({
  labels: analytics.value.orderValueTrends.map(t => format(t.date, 'MMM d, yyyy')),
  datasets: [{
    label: 'Order Value',
    data: analytics.value.orderValueTrends.map(t => t.value),
    borderColor: '#667eea',
    tension: 0.4
  }]
}));

const paymentCycleChartData = computed(() => ({
  labels: analytics.value.paymentMetrics.paymentTrends.map(t => format(t.date, 'MMM d, yyyy')),
  datasets: [{
    label: 'Days to Payment',
    data: analytics.value.paymentMetrics.paymentTrends.map(t => t.daysToPayment),
    borderColor: '#764ba2',
    tension: 0.4
  }]
}));

async function fetchAnalytics() {
  try {
    let url = '/api/admin/analytics';
    if (dateRange.value) {
      const [start, end] = dateRange.value;
      url += `?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
    }

    const { data } = await supabase.get(url);
    analytics.value = data;
  } catch (error) {
    console.error('Failed to fetch analytics:', error);
  }
}

async function exportAnalytics() {
  try {
    const response = await fetch('/api/admin/analytics/export', {
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`
      }
    });

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
  } catch (error) {
    console.error('Failed to export analytics:', error);
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

onMounted(fetchAnalytics);
</script>

<style lang="scss" scoped>
.analytics {
  .stats-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
}
</style>
