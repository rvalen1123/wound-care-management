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
import { ref, computed, onMounted } from 'vue'
import { chartDataService } from '@/services/chartDataService'
import { format } from 'date-fns'

const analytics = ref({
  orderValueTrends: [],
  productPerformance: [],
  repPerformance: []
})

const dateRange = ref([new Date(), new Date()])

const orderValueChartData = computed(() => ({
  labels: analytics.value.orderValueTrends.map(t => format(t.date, 'MMM d, yyyy')),
  datasets: [{
    label: 'Order Value',
    data: analytics.value.orderValueTrends.map(t => t.value),
    backgroundColor: '#4F46E5',
    borderColor: '#4338CA',
    borderWidth: 1
  }]
}))

const fetchAnalytics = async () => {
  try {
    const [ordersByMonth, ordersByProduct, commissionsByRep] = await Promise.all([
      chartDataService.getOrdersByMonth(),
      chartDataService.getOrdersByProduct(),
      chartDataService.getCommissionsByRep()
    ])

    analytics.value = {
      orderValueTrends: ordersByMonth.datasets[0].data.map((value, index) => ({
        date: new Date(ordersByMonth.labels[index]),
        value
      })),
      productPerformance: ordersByProduct.datasets[0].data.map((value, index) => ({
        name: ordersByProduct.labels[index],
        value
      })),
      repPerformance: commissionsByRep.datasets[0].data.map((value, index) => ({
        name: commissionsByRep.labels[index],
        value
      }))
    }
  } catch (error) {
    console.error('Error fetching analytics:', error)
  }
}

const exportAnalytics = async () => {
  try {
    const data = {
      orderValueTrends: analytics.value.orderValueTrends,
      productPerformance: analytics.value.productPerformance,
      repPerformance: analytics.value.repPerformance
    }

    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `analytics-${format(new Date(), 'yyyy-MM-dd')}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  } catch (error) {
    console.error('Error exporting analytics:', error)
  }
}

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

onMounted(fetchAnalytics)
</script>

<style lang="scss" scoped>
.analytics {
  .stats-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
}
</style>
