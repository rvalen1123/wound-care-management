<template>
  <div class="my-stats">
    <vx-card>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="h3 mb-0">My Statistics</h1>
          <vx-datepicker
            v-model="dateRange"
            range
            class="d-inline-block"
            @change="fetchStats"
          />
        </div>
      </template>

      <!-- Key Metrics -->
      <div class="row g-4 mb-4">
        <div class="col-md-3">
          <vx-card class="stats-card">
            <h3 class="h6 mb-2">Total Earnings</h3>
            <div class="h4 mb-0">${{ formatNumber(stats.totalEarnings) }}</div>
          </vx-card>
        </div>

        <div class="col-md-3">
          <vx-card class="stats-card">
            <h3 class="h6 mb-2">Paid Amount</h3>
            <div class="h4 mb-0">${{ formatNumber(stats.paidAmount) }}</div>
          </vx-card>
        </div>

        <div class="col-md-3">
          <vx-card class="stats-card">
            <h3 class="h6 mb-2">Pending Amount</h3>
            <div class="h4 mb-0">${{ formatNumber(stats.pendingAmount) }}</div>
          </vx-card>
        </div>

        <div class="col-md-3">
          <vx-card class="stats-card">
            <h3 class="h6 mb-2">Total Orders</h3>
            <div class="h4 mb-0">{{ stats.totalOrders }}</div>
          </vx-card>
        </div>
      </div>

      <!-- Charts -->
      <div class="row g-4">
        <div class="col-md-6">
          <vx-card>
            <template #header>
              <h3 class="h5 mb-0">Monthly Earnings</h3>
            </template>
            <vx-chart
              type="bar"
              :data="monthlyEarningsChart"
              :options="chartOptions"
              height="300"
            />
          </vx-card>
        </div>

        <div class="col-md-6">
          <vx-card>
            <template #header>
              <h3 class="h5 mb-0">Orders Status</h3>
            </template>
            <vx-chart
              type="doughnut"
              :data="orderStatusChart"
              :options="pieChartOptions"
              height="300"
            />
          </vx-card>
        </div>
      </div>

      <!-- Doctor Performance -->
      <vx-card class="mt-4">
        <template #header>
          <h3 class="h5 mb-0">Doctor Performance</h3>
        </template>

        <vx-table
          :items="doctorPerformance"
          :fields="doctorFields"
          responsive
          hover
        >
          <template #cell(totalOrders)="{ value }">
            {{ value }}
          </template>
          <template #cell(totalRevenue)="{ value }">
            ${{ formatNumber(value) }}
          </template>
          <template #cell(totalCommission)="{ value }">
            ${{ formatNumber(value) }}
          </template>
        </vx-table>
      </vx-card>
    </vx-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { format, startOfMonth, endOfMonth, eachMonthOfInterval } from 'date-fns';
import { supabase } from '@/config/supabase';
import { SalesRepStats } from '@/models/SalesRepStats';

const stats = ref<SalesRepStats>({
  totalEarnings: 0,
  paidAmount: 0,
  pendingAmount: 0,
  totalOrders: 0,
  activeOrders: 0,
  completedOrders: 0
});

const dateRange = ref<[Date, Date]>([
  startOfMonth(new Date()),
  endOfMonth(new Date())
]);

const doctorPerformance = ref<any[]>([]);

const doctorFields = [
  { key: 'doctorName', label: 'Doctor' },
  { key: 'totalOrders', label: 'Orders' },
  { key: 'totalRevenue', label: 'Revenue' },
  { key: 'totalCommission', label: 'Commission' }
];

const chartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  scales: {
    y: {
      beginAtZero: true,
      ticks: {
        callback: (value: number) => `$${formatNumber(value)}`
      }
    }
  }
};

const pieChartOptions = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      position: 'bottom'
    }
  }
};

const monthlyEarningsChart = computed(() => {
  const months = eachMonthOfInterval({
    start: dateRange.value[0],
    end: dateRange.value[1]
  });

  const monthlyData = months.map(month => {
    const monthOrders = orders.value.filter(order => 
      format(new Date(order.dateOfService), 'yyyy-MM') === format(month, 'yyyy-MM')
    );

    return {
      month: format(month, 'MMM yyyy'),
      earnings: monthlyOrders.reduce((sum, order) => sum + order.repCommission, 0)
    };
  });

  return {
    labels: monthlyData.map(d => d.month),
    datasets: [{
      label: 'Monthly Earnings',
      data: monthlyData.map(d => d.earnings),
      backgroundColor: '#667eea'
    }]
  };
});

const orderStatusChart = computed(() => ({
  labels: ['Active', 'Processing', 'Completed'],
  datasets: [{
    data: [
      stats.value.activeOrders,
      orders.value.filter(o => o.manufacturerPaidDate && !o.repPaidDate).length,
      stats.value.completedOrders
    ],
    backgroundColor: ['#667eea', '#ffd60a', '#38a169']
  }]
}));

const orders = ref<any[]>([]);

onMounted(fetchStats);

async function fetchStats() {
  try {
    // Fetch orders
    const { data: ordersData, error: ordersError } = await supabase
      .from('orders')
      .select(`
        *,
        doctors:doctorId (
          id,
          name
        )
      `)
      .eq('repId', localStorage.getItem('userId'))
      .gte('dateOfService', dateRange.value[0].toISOString())
      .lte('dateOfService', dateRange.value[1].toISOString());

    if (ordersError) throw ordersError;
    orders.value = ordersData;

    // Calculate stats
    stats.value = {
      totalEarnings: orders.value.reduce((sum, order) => sum + order.repCommission, 0),
      paidAmount: orders.value.reduce((sum, order) => sum + (order.repPaidDate ? order.repCommission : 0), 0),
      pendingAmount: orders.value.reduce((sum, order) => sum + (!order.repPaidDate ? order.repCommission : 0), 0),
      totalOrders: orders.value.length,
      activeOrders: orders.value.filter(order => !order.manufacturerPaidDate).length,
      completedOrders: orders.value.filter(order => order.repPaidDate).length
    };

    // Calculate doctor performance
    const doctorStats = new Map<string, any>();
    
    orders.value.forEach(order => {
      const doctorId = order.doctorId;
      const current = doctorStats.get(doctorId) || {
        doctorName: order.doctors.name,
        totalOrders: 0,
        totalRevenue: 0,
        totalCommission: 0
      };

      current.totalOrders++;
      current.totalRevenue += order.invoiceAmount;
      current.totalCommission += order.repCommission;
      
      doctorStats.set(doctorId, current);
    });

    doctorPerformance.value = Array.from(doctorStats.values())
      .sort((a, b) => b.totalRevenue - a.totalRevenue);

  } catch (error) {
    console.error('Failed to fetch stats:', error);
  }
}

function formatNumber(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}
</script>

<style lang="scss" scoped>
.my-stats {
  .stats-card {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: white;
  }
}
</style>
