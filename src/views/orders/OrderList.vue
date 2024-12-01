<template>
  <Layout
    title="Graft Orders"
    :loading="loading"
    :error="error"
  >
    <template #actions>
      <router-link
        to="/orders/new"
        class="inline-flex items-center px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-indigo-500"
      >
        <svg class="-ml-1 mr-2 h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
        </svg>
        New Order
      </router-link>
    </template>

    <!-- Filters -->
    <div class="bg-gray-800 rounded-lg p-4 mb-6">
      <div class="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div>
          <label class="block text-sm font-medium text-gray-400">Status</label>
          <select
            v-model="filters.status"
            class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500"
            @change="handleFilterChange"
          >
            <option value="">All</option>
            <option value="paid">Paid</option>
            <option value="partial">Partial</option>
            <option value="outstanding">Outstanding</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400">Date Range</label>
          <select
            v-model="filters.dateRange"
            class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500"
            @change="handleFilterChange"
          >
            <option value="7">Last 7 days</option>
            <option value="30">Last 30 days</option>
            <option value="90">Last 90 days</option>
            <option value="all">All time</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400">Sort By</label>
          <select
            v-model="sortBy"
            class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500"
            @change="handleFilterChange"
          >
            <option value="date_of_service">Date of Service</option>
            <option value="invoice_to_doc">Amount</option>
            <option value="status">Status</option>
          </select>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400">Sort Direction</label>
          <select
            v-model="sortDesc"
            class="mt-1 block w-full rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500"
            @change="handleFilterChange"
          >
            <option :value="true">Descending</option>
            <option :value="false">Ascending</option>
          </select>
        </div>
      </div>
    </div>

    <!-- Orders Table -->
    <div class="bg-gray-800 rounded-lg overflow-hidden">
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Order ID</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date of Service</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Doctor</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Product</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="order in orders" :key="order.id" class="hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ order.id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatDate(order.date_of_service) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ order.doctor?.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ order.product?.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                ${{ formatCurrency(order.invoice_to_doc) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(order.status)">
                  {{ order.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                <button
                  @click="openOrderDetails(order)"
                  class="text-indigo-400 hover:text-indigo-300"
                >
                  View Details
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div class="bg-gray-800 px-4 py-3 border-t border-gray-700 sm:px-6">
        <div class="flex items-center justify-between">
          <div class="flex-1 flex justify-between sm:hidden">
            <button
              @click="prevPage"
              :disabled="currentPage === 1"
              class="relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-400 bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
            >
              Previous
            </button>
            <button
              @click="nextPage"
              :disabled="currentPage === totalPages"
              class="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-700 text-sm font-medium rounded-md text-gray-400 bg-gray-800 hover:bg-gray-700 disabled:opacity-50"
            >
              Next
            </button>
          </div>
          <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
            <div>
              <p class="text-sm text-gray-400">
                Showing
                <span class="font-medium">{{ startIndex + 1 }}</span>
                to
                <span class="font-medium">{{ endIndex }}</span>
                of
                <span class="font-medium">{{ totalOrders }}</span>
                results
              </p>
            </div>
            <div>
              <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                <button
                  @click="prevPage"
                  :disabled="currentPage === 1"
                  class="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50"
                >
                  <span class="sr-only">Previous</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
                <button
                  @click="nextPage"
                  :disabled="currentPage === totalPages"
                  class="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-700 bg-gray-800 text-sm font-medium text-gray-400 hover:bg-gray-700 disabled:opacity-50"
                >
                  <span class="sr-only">Next</span>
                  <svg class="h-5 w-5" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                    <path fill-rule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clip-rule="evenodd" />
                  </svg>
                </button>
              </nav>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Order Details Modal -->
    <OrderDetailsModal
      v-if="selectedOrder"
      :order="selectedOrder"
      @close="selectedOrder = null"
    />
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import Layout from '@/components/common/ui/Layout.vue';
import OrderDetailsModal from '@/components/orders/OrderDetailsModal.vue';
import { dataService } from '@/services/data.service';
import type { Order } from '@/types/models';

const loading = ref(true);
const error = ref<string | null>(null);
const orders = ref<Order[]>([]);
const selectedOrder = ref<Order | null>(null);
const totalOrders = ref(0);

// Pagination
const currentPage = ref(1);
const pageSize = 10;

// Filters and Sorting
const filters = ref({
  status: '',
  dateRange: '30'
});
const sortBy = ref('date_of_service');
const sortDesc = ref(true);

// Computed
const totalPages = computed(() => Math.ceil(totalOrders.value / pageSize));
const startIndex = computed(() => (currentPage.value - 1) * pageSize);
const endIndex = computed(() => Math.min(startIndex.value + pageSize, totalOrders.value));

// Methods
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

const getStatusClass = (status: string): string => {
  const classes = {
    paid: 'px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300',
    partial: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-900 text-yellow-300',
    outstanding: 'px-2 py-1 text-xs font-medium rounded-full bg-red-900 text-red-300'
  };
  return classes[status as keyof typeof classes] || '';
};

const loadOrders = async () => {
  try {
    loading.value = true;
    error.value = null;

    const { data, error: loadError, count } = await dataService.getOrders({
      page: currentPage.value,
      limit: pageSize,
      sortBy: sortBy.value,
      sortDesc: sortDesc.value,
      filters: {
        status: filters.value.status || undefined,
        date_range: filters.value.dateRange
      }
    });

    if (loadError) throw loadError;

    orders.value = data || [];
    totalOrders.value = count || 0;
  } catch (err) {
    console.error('Error loading orders:', err);
    error.value = 'Failed to load orders';
  } finally {
    loading.value = false;
  }
};

const openOrderDetails = (order: Order) => {
  selectedOrder.value = order;
};

const prevPage = () => {
  if (currentPage.value > 1) {
    currentPage.value--;
    loadOrders();
  }
};

const nextPage = () => {
  if (currentPage.value < totalPages.value) {
    currentPage.value++;
    loadOrders();
  }
};

const handleFilterChange = () => {
  currentPage.value = 1; // Reset to first page when filters change
  loadOrders();
};

// Initial load
onMounted(() => {
  loadOrders();
});
</script>
