<template>
  <div class="financial-reporting">
    <h1 class="text-2xl font-bold mb-6 text-green-700">Financial Reporting</h1>
    
    <!-- Financial Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2">Total Revenue</h2>
        <p class="text-3xl font-bold text-green-600">${{ formatNumber(totalRevenue) }}</p>
        <p class="text-sm text-gray-500 mt-2">
          <span :class="revenueGrowth >= 0 ? 'text-green-500' : 'text-red-500'">
            {{ revenueGrowth >= 0 ? '↑' : '↓' }} {{ Math.abs(revenueGrowth) }}%
          </span>
          vs last month
        </p>
      </div>
      
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2">Pending Payments</h2>
        <p class="text-3xl font-bold text-yellow-600">${{ formatNumber(pendingPayments) }}</p>
        <p class="text-sm text-gray-500 mt-2">{{ pendingPaymentsCount }} invoices pending</p>
      </div>
      
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2">Commissions Paid</h2>
        <p class="text-3xl font-bold text-blue-600">${{ formatNumber(commissionsPaid) }}</p>
        <p class="text-sm text-gray-500 mt-2">This month</p>
      </div>
      
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2">Average Order Value</h2>
        <p class="text-3xl font-bold text-purple-600">${{ formatNumber(averageOrderValue) }}</p>
        <p class="text-sm text-gray-500 mt-2">Based on {{ totalOrders }} orders</p>
      </div>
    </div>

    <!-- Revenue Chart -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <h2 class="text-xl font-semibold mb-4">Revenue Trends</h2>
      <div class="h-64">
        <LineChart :chartData="revenueChartData" :options="chartOptions" />
      </div>
    </div>

    <!-- Recent Transactions -->
    <div class="bg-white shadow-md rounded-lg">
      <h2 class="text-xl font-semibold p-6 pb-0">Recent Transactions</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-4 text-left">Date</th>
              <th class="p-4 text-left">Order ID</th>
              <th class="p-4 text-left">Customer</th>
              <th class="p-4 text-left">Amount</th>
              <th class="p-4 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="transaction in recentTransactions" :key="transaction.id" class="border-t">
              <td class="p-4">{{ formatDate(transaction.date) }}</td>
              <td class="p-4">{{ transaction.orderId }}</td>
              <td class="p-4">{{ transaction.customerName }}</td>
              <td class="p-4">${{ formatNumber(transaction.amount) }}</td>
              <td class="p-4">
                <span :class="getStatusClass(transaction.status)">
                  {{ transaction.status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
import { Line as LineChart } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from 'chart.js'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

export default {
  name: 'FinancialReporting',
  components: {
    LineChart
  },
  data() {
    return {
      totalRevenue: 250000,
      revenueGrowth: 12.5,
      pendingPayments: 45000,
      pendingPaymentsCount: 15,
      commissionsPaid: 25000,
      averageOrderValue: 3500,
      totalOrders: 72,
      
      revenueChartData: {
        labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
        datasets: [{
          label: 'Revenue',
          data: [30000, 45000, 35000, 50000, 42000, 48000],
          borderColor: '#22c55e',
          tension: 0.4
        }]
      },
      
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false
      },
      
      recentTransactions: [
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
        // Add more transactions as needed
      ]
    }
  },
  methods: {
    formatNumber(value) {
      return value.toLocaleString('en-US', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
      })
    },
    
    formatDate(date) {
      return new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      }).format(date)
    },
    
    getStatusClass(status) {
      return {
        'completed': 'text-green-600',
        'pending': 'text-yellow-600',
        'failed': 'text-red-600'
      }[status] || 'text-gray-600'
    }
  },
  created() {
    // Fetch financial data
    // this.$store.dispatch('fetchFinancialData')
  }
}
</script>

<style scoped>
.financial-reporting {
  background-color: #f4f7f6;
  padding: 2rem;
}
</style>
