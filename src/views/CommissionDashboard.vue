<template>
  <!-- Template remains the same -->
  <Layout
    title="Commission Dashboard"
    :loading="loading"
    :error="error"
  >
    <!-- Commission Summary Cards -->
    <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
      <!-- Total Commission -->
      <Card>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-green-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-400 truncate">
                Total Commission
              </dt>
              <dd class="text-lg font-semibold text-green-400">
                {{ formatCurrency(totalCommission) }}
              </dd>
            </dl>
          </div>
        </div>
      </Card>

      <!-- Direct Commission -->
      <Card>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-blue-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-400 truncate">
                Direct Commission
              </dt>
              <dd class="text-lg font-semibold text-blue-400">
                {{ formatCurrency(directCommission) }}
              </dd>
            </dl>
          </div>
        </div>
      </Card>

      <!-- Indirect Commission -->
      <Card>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-purple-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-400 truncate">
                Indirect Commission
              </dt>
              <dd class="text-lg font-semibold text-purple-400">
                {{ formatCurrency(indirectCommission) }}
              </dd>
            </dl>
          </div>
        </div>
      </Card>

      <!-- Pending Commission -->
      <Card>
        <div class="flex items-center">
          <div class="flex-shrink-0">
            <svg class="h-6 w-6 text-yellow-400" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div class="ml-5 w-0 flex-1">
            <dl>
              <dt class="text-sm font-medium text-gray-400 truncate">
                Pending Commission
              </dt>
              <dd class="text-lg font-semibold text-yellow-400">
                {{ formatCurrency(pendingCommission) }}
              </dd>
            </dl>
          </div>
        </div>
      </Card>
    </div>

    <!-- Orders Table -->
    <Card>
      <template #header>
        <h3 class="text-lg leading-6 font-medium text-gray-200">
          Recent Orders
        </h3>
      </template>

      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead class="bg-gray-700">
            <tr>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Order ID
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Invoice Amount
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Commission
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Status
              </th>
              <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                Date
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="order in orders" :key="order.order_id" class="hover:bg-gray-750">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ order.order_id }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatCurrency(order.invoice_to_doc) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatCurrency(order.msc_commission || 0) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <Badge
                  :severity="getStatusSeverity(order.status)"
                >
                  {{ order.status }}
                </Badge>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatDate(order.created_at) }}
              </td>
            </tr>

            <!-- Empty State -->
            <tr v-if="orders.length === 0">
              <td colspan="5">
                <EmptyState
                  icon="history"
                  message="No orders found"
                />
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { supabase } from '../lib/supabaseClient';
import type { Order } from '../types/models';
import { Layout, Card, Badge, EmptyState } from '../components/common/ui';

const authStore = useAuthStore();

const loading = ref(false);
const error = ref<string | null>(null);
const orders = ref<Order[]>([]);

// Computed values for commission summary
const totalCommission = computed(() => 
  orders.value.reduce((sum: number, order: Order) => 
    sum + (order.msc_commission || 0), 
    0
  )
);

const directCommission = computed(() => 
  orders.value
    .filter((order: Order) => 
      order.master_rep_id === authStore.user?.id
    )
    .reduce((sum: number, order: Order) => 
      sum + (order.msc_commission || 0), 
      0
    )
);

const indirectCommission = computed(() => 
  orders.value
    .filter((order: Order) => 
      (order.sub_rep_id === authStore.user?.id || order.sub_sub_rep_id === authStore.user?.id) &&
      order.master_rep_id !== authStore.user?.id
    )
    .reduce((sum: number, order: Order) => 
      sum + (order.msc_commission || 0), 
      0
    )
);

const pendingCommission = computed(() => 
  orders.value
    .filter((order: Order) => 
      order.status === 'pending'
    )
    .reduce((sum: number, order: Order) => 
      sum + (order.invoice_to_doc * 0.4), 
      0
    )
);

async function loadOrders() {
  if (!authStore.user?.id) return;

  loading.value = true;
  try {
    const { data, error: queryError } = await supabase
      .from('orders')
      .select(`
        *,
        doctor:doctor_id(*),
        master_rep:master_rep_id(*),
        sub_rep:sub_rep_id(*),
        sub_sub_rep:sub_sub_rep_id(*)
      `)
      .or(`master_rep_id.eq.${authStore.user.id},sub_rep_id.eq.${authStore.user.id},sub_sub_rep_id.eq.${authStore.user.id}`)
      .order('created_at', { ascending: false });

    if (queryError) throw queryError;
    orders.value = data || [];
  } catch (err) {
    console.error('Error loading orders:', err);
    error.value = err instanceof Error ? err.message : 'Failed to load orders';
  } finally {
    loading.value = false;
  }
}

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

function getStatusSeverity(status: string): 'warning' | 'success' | 'danger' {
  switch (status) {
    case 'pending':
      return 'warning';
    case 'paid':
      return 'success';
    case 'outstanding':
      return 'danger';
    default:
      return 'warning';
  }
}

onMounted(() => {
  loadOrders();
});
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgba(55, 65, 81, 0.5);
}
</style>
