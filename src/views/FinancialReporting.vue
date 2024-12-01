<template>
  <Layout
    title="Financial Reporting"
    :loading="loading"
    :error="error"
  >
    <!-- Financial Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2 text-gray-300">Total Revenue</h2>
        <p class="text-3xl font-bold text-white">${{ formatNumber(totalRevenue) }}</p>
        <p class="text-sm text-gray-400 mt-2">
          <span :class="revenueGrowth >= 0 ? 'text-green-400' : 'text-red-400'">
            {{ revenueGrowth >= 0 ? '↑' : '↓' }} {{ Math.abs(revenueGrowth) }}%
          </span>
          vs last month
        </p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2 text-gray-300">Pending Payments</h2>
        <p class="text-3xl font-bold text-white">${{ formatNumber(pendingPayments) }}</p>
        <p class="text-sm text-gray-400 mt-2">{{ pendingPaymentsCount }} invoices pending</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2 text-gray-300">Commissions Paid</h2>
        <p class="text-3xl font-bold text-white">${{ formatNumber(commissionsPaid) }}</p>
        <p class="text-sm text-gray-400 mt-2">This month</p>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2 text-gray-300">Average Order Value</h2>
        <p class="text-3xl font-bold text-white">${{ formatNumber(averageOrderValue) }}</p>
        <p class="text-sm text-gray-400 mt-2">Based on {{ totalOrders }} orders</p>
      </div>
    </div>

    <!-- Revenue Chart -->
    <div class="bg-gray-800 rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4 text-white">Revenue Trends</h2>
      <div class="h-64">
        <LineChart :chartData="revenueChartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-gray-800 rounded-lg">
      <h2 class="text-xl font-semibold p-6 pb-0 text-white">Recent Transactions</h2>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="transaction in recentTransactions" :key="transaction.id" class="hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatDate(transaction.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ transaction.orderId }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ transaction.customerName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                ${{ formatNumber(transaction.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(transaction.status)">
                  {{ transaction.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Line as LineChart } from 'vue-chartjs';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js';
import Layout from '@/components/common/ui/Layout.vue';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

interface Transaction {
  id: number;
  date: Date;
  orderId: string;
  customerName: string;
  amount: number;
  status: 'completed' | 'pending' | 'failed';
}

const loading = ref(false);
const error = ref<string | null>(null);
const totalRevenue = ref(250000);
const revenueGrowth = ref(12.5);
const pendingPayments = ref(45000);
const pendingPaymentsCount = ref(15);
const commissionsPaid = ref(25000);
const averageOrderValue = ref(3500);
const totalOrders = ref(72);

const revenueChartData = ref({
  labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
  datasets: [{
    label: 'Revenue',
    data: [30000, 45000, 35000, 50000, 42000, 48000],
    borderColor: '#22c55e',
    tension: 0.4
  }]
});

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      ticks: { color: '#9ca3af' },
      grid: { color: '#374151' }
    },
    x: {
      ticks: { color: '#9ca3af' },
      grid: { color: '#374151' }
    }
  },
  plugins: {
    legend: {
      labels: { color: '#9ca3af' }
    }
  }
};

const recentTransactions = ref<Transaction[]>([
  {
    id: 1,
    date: new Date('2024-01-15'),
    orderId: 'ORD-001',
    customerName: 'City Hospital',
    amount: 5000,
    status: 'completed'
  },
  {
    id: 2,
    date: new Date('2024-01-14'),
    orderId: 'ORD-002',
    customerName: 'Medical Center',
    amount: 3500,
    status: 'pending'
  }
]);

const formatNumber = (value: number): string => {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

const formatDate = (date: Date): string => {
  return new Intl.DateTimeFormat('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }).format(date);
};

const getStatusClass = (status: string): string => {
  const classes = {
    completed: 'px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300',
    pending: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-900 text-yellow-300',
    failed: 'px-2 py-1 text-xs font-medium rounded-full bg-red-900 text-red-300'
  };
  return classes[status as keyof typeof classes] || '';
};

onMounted(() => {
  // TODO: Fetch financial data
  // await store.dispatch('fetchFinancialData');
});
</script>
