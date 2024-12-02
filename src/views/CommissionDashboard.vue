<template>
  <div class="min-h-screen bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Commission Summary Cards -->
      <div class="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-4 mb-8">
        <!-- Total Commission -->
        <div class="bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
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
                    {{ formatCurrency(commissionStore.getTotalCommission) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Direct Commission -->
        <div class="bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
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
                    {{ formatCurrency(commissionStore.getDirectCommission) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Indirect Commission -->
        <div class="bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
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
                    {{ formatCurrency(commissionStore.getIndirectCommission) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>

        <!-- Pending Commission -->
        <div class="bg-gray-800 overflow-hidden shadow rounded-lg">
          <div class="p-5">
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
                    {{ formatCurrency(commissionStore.commissionSummary?.pending_commission || 0) }}
                  </dd>
                </dl>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Commission Structures Table -->
      <div class="bg-gray-800 shadow rounded-lg">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-700">
          <h3 class="text-lg leading-6 font-medium text-white">
            Commission Structures
          </h3>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-700">
            <thead class="bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Base Amount
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Final Amount
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Created At
                </th>
              </tr>
            </thead>
            <tbody class="bg-gray-800 divide-y divide-gray-700">
              <tr v-for="structure in commissionStore.structures" :key="structure.id" class="hover:bg-gray-750">
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ structure.order_id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ formatCurrency(structure.base_commission_amount) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ formatCurrency(structure.final_commission_amount || 0) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap">
                  <span :class="{
                    'px-2 inline-flex text-xs leading-5 font-semibold rounded-full': true,
                    'bg-yellow-800 text-yellow-100': structure.status === 'pending',
                    'bg-green-800 text-green-100': structure.status === 'approved',
                    'bg-red-800 text-red-100': structure.status === 'rejected'
                  }">
                    {{ structure.status }}
                  </span>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ formatDate(structure.created_at) }}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useCommissionStore } from '../stores/commissionStore';
import { useAuthStore } from '../stores/auth';

const commissionStore = useCommissionStore();
const authStore = useAuthStore();

onMounted(async () => {
  if (authStore.user?.id) {
    await Promise.all([
      commissionStore.fetchCommissionStructures(authStore.user.id),
      commissionStore.fetchCommissionSummary(authStore.user.id)
    ]);
  }
});

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
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgba(55, 65, 81, 0.5);
}
</style>
