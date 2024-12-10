<!-- Template remains the same -->
<template>
  <Layout
    title="Dashboard"
    :loading="loading"
    :error="error"
  >
    <!-- Key Metrics -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-sm font-medium text-gray-400">Owed by Doctors</h3>
        <p class="mt-2 text-3xl font-bold text-white">${{ formatCurrency(metrics.owedByDoctors) }}</p>
        <div class="mt-1 text-sm text-gray-400">
          From {{ metrics.totalDoctors }} active doctors
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-sm font-medium text-gray-400">Owed To Manufacturers</h3>
        <p class="mt-2 text-3xl font-bold text-white">${{ formatCurrency(metrics.owedToManufacturers) }}</p>
        <div class="mt-1 text-sm text-gray-400">
          Across {{ metrics.totalProducts }} products
        </div>
      </div>

      <div class="bg-gray-800 rounded-lg p-6">
        <h3 class="text-sm font-medium text-gray-400">Owed In Commissions</h3>
        <p class="mt-2 text-3xl font-bold text-white">${{ formatCurrency(metrics.owedInCommissions) }}</p>
        <div class="mt-1 text-sm text-gray-400">
          To {{ metrics.totalReps }} representatives
        </div>
      </div>
    </div>

    <!-- Recent Orders -->
    <div class="bg-gray-800 rounded-lg p-6 mb-6">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-lg font-medium text-white">Recent Orders</h2>
        <router-link 
          to="/graft-orders" 
          class="text-sm text-indigo-400 hover:text-indigo-300"
        >
          View all
        </router-link>
      </div>
      
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date of Service</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Doctor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="order in recentOrders" :key="order.order_id" class="hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ order.order_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatDate(order.date_of_service) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ order.doctor?.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                ${{ formatCurrency(order.invoice_to_doc) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(order.payment_status)">
                  {{ order.payment_status }}
                </span>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Sales Rep Hierarchy and Analytics -->
    <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
      <!-- Sales Rep Table -->
      <div class="lg:col-span-2 bg-gray-800 rounded-lg p-6">
        <div class="flex justify-between items-center mb-4">
          <h2 class="text-lg font-medium text-white">Sales Representatives</h2>
          <router-link 
            to="/reps" 
            class="text-sm text-indigo-400 hover:text-indigo-300"
          >
            View all
          </router-link>
        </div>

        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-700">
            <thead>
              <tr>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Rep Name</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"># of Accounts</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider"># of Sub Reps</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">$ in Sales</th>
                <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">$ in Commission</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-gray-700">
              <tr v-for="rep in salesReps" :key="rep.id" class="hover:bg-gray-700">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div class="h-8 w-8 rounded-full bg-gray-600 flex items-center justify-center">
                      <span class="text-sm font-medium text-white">
                        {{ getInitials(rep.name) }}
                      </span>
                    </div>
                    <div class="ml-4">
                      <div class="text-sm font-medium text-white">{{ rep.name }}</div>
                      <div class="text-sm text-gray-400">{{ rep.email }}</div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ rep.accountCount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ rep.subRepCount }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  ${{ formatCurrency(rep.totalSales) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  ${{ formatCurrency(rep.totalCommission) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Analytics Overview -->
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-medium text-white mb-4">Analytics Overview</h2>
        
        <div class="space-y-4">
          <div>
            <h3 class="text-sm font-medium text-gray-400 mb-2">Total Sales (30 days)</h3>
            <p class="text-2xl font-bold text-white">${{ formatCurrency(analytics.totalSales) }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-400 mb-2">Total Commissions (30 days)</h3>
            <p class="text-2xl font-bold text-white">${{ formatCurrency(analytics.totalCommissions) }}</p>
          </div>

          <div>
            <h3 class="text-sm font-medium text-gray-400 mb-2">Top Performing Reps</h3>
            <div class="space-y-2">
              <div v-for="rep in analytics.topReps" :key="rep.id" class="flex justify-between items-center">
                <span class="text-sm text-gray-300">{{ rep.name }}</span>
                <span class="text-sm text-gray-400">${{ formatCurrency(rep.totalSales) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { Layout } from '../components/common/ui';
import { dataService } from '../services/data.service';
import type { Order, Representative, Analytics, DashboardMetrics } from '../types/models';

const loading = ref(true);
const error = ref<string | null>(null);
const metrics = ref<DashboardMetrics>({
  owedByDoctors: 0,
  owedToManufacturers: 0,
  owedInCommissions: 0,
  totalDoctors: 0,
  totalProducts: 0,
  totalReps: 0
});
const recentOrders = ref<Order[]>([]);
const salesReps = ref<Representative[]>([]);
const analytics = ref<Analytics>({
  totalSales: 0,
  totalCommissions: 0,
  topReps: []
});

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('en-US').format(value);
};

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const getInitials = (name: string): string => {
  return name
    .split(' ')
    .map(word => word[0])
    .join('')
    .toUpperCase();
};

const getStatusClass = (status: string): string => {
  const classes = {
    paid: 'px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300',
    partial: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-900 text-yellow-300',
    outstanding: 'px-2 py-1 text-xs font-medium rounded-full bg-red-900 text-red-300'
  };
  return classes[status as keyof typeof classes] || '';
};

const loadDashboardData = async (): Promise<void> => {
  try {
    loading.value = true;
    error.value = null;

    // Load orders
    const { data: ordersData, error: ordersError } = await dataService.getOrders({
      limit: 5,
      sortBy: 'created_at',
      sortDesc: true
    });

    if (ordersError) throw ordersError;
    recentOrders.value = ordersData || [];

    // Load reps
    const { data: repsData, error: repsError } = await dataService.getReps({
      limit: 5,
      sortBy: 'totalSales',
      sortDesc: true
    });

    if (repsError) throw repsError;
    salesReps.value = repsData || [];

    // Load analytics
    const { data: analyticsData, error: analyticsError } = await dataService.getAnalytics('month');

    if (analyticsError) throw analyticsError;
    analytics.value = analyticsData || { totalSales: 0, totalCommissions: 0, topReps: [] };

    // Calculate metrics
    metrics.value = {
      owedByDoctors: recentOrders.value.reduce((sum: number, order: Order) => {
        return sum + (order.payment_status === 'outstanding' ? order.invoice_to_doc : 0);
      }, 0),
      owedToManufacturers: recentOrders.value.reduce((sum: number, order: Order) => {
        return sum + (order.payment_status === 'outstanding' ? order.invoice_to_doc * 0.4 : 0);
      }, 0),
      owedInCommissions: analytics.value.totalCommissions,
      totalDoctors: new Set(recentOrders.value.map((order: Order) => order.doctor_id)).size,
      totalProducts: new Set(recentOrders.value.map((order: Order) => order.q_code)).size,
      totalReps: salesReps.value.length
    };
  } catch (err) {
    console.error('Error loading dashboard data:', err);
    error.value = 'Failed to load dashboard data';
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
  loadDashboardData();
});
</script>
