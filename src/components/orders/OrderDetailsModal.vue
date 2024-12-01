<template>
  <div class="fixed inset-0 z-50 overflow-y-auto" @click.self="$emit('close')">
    <div class="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity bg-gray-900 bg-opacity-75"></div>

      <!-- Modal panel -->
      <div class="inline-block px-4 pt-5 pb-4 overflow-hidden text-left align-bottom transition-all transform bg-gray-800 rounded-lg shadow-xl sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <div class="absolute top-0 right-0 pt-4 pr-4">
          <button
            type="button"
            class="text-gray-400 hover:text-gray-300"
            @click="$emit('close')"
          >
            <span class="sr-only">Close</span>
            <svg class="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <div class="sm:flex sm:items-start">
          <div class="w-full mt-3 text-center sm:mt-0 sm:text-left">
            <h3 class="text-lg font-medium leading-6 text-white">
              Order Details
            </h3>

            <div class="mt-4 space-y-4">
              <!-- Order Info -->
              <div class="grid grid-cols-2 gap-4">
                <div>
                  <label class="block text-sm font-medium text-gray-400">Order ID</label>
                  <p class="mt-1 text-sm text-white">{{ order.id }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Date of Service</label>
                  <p class="mt-1 text-sm text-white">{{ formatDate(order.date_of_service) }}</p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Status</label>
                  <p class="mt-1">
                    <span :class="getStatusClass(order.status)">
                      {{ order.status }}
                    </span>
                  </p>
                </div>
                <div>
                  <label class="block text-sm font-medium text-gray-400">Amount</label>
                  <p class="mt-1 text-sm text-white">${{ formatNumber(order.invoice_to_doc) }}</p>
                </div>
              </div>

              <!-- Doctor Info -->
              <div class="pt-4 border-t border-gray-700">
                <h4 class="text-sm font-medium text-gray-400">Doctor Information</h4>
                <div class="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-400">Name</label>
                    <p class="mt-1 text-sm text-white">{{ order.doctor?.name }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-400">Email</label>
                    <p class="mt-1 text-sm text-white">{{ order.doctor?.email }}</p>
                  </div>
                </div>
              </div>

              <!-- Product Info -->
              <div class="pt-4 border-t border-gray-700">
                <h4 class="text-sm font-medium text-gray-400">Product Information</h4>
                <div class="mt-2 grid grid-cols-2 gap-4">
                  <div>
                    <label class="block text-sm font-medium text-gray-400">Product</label>
                    <p class="mt-1 text-sm text-white">{{ order.product?.name }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-400">Size</label>
                    <p class="mt-1 text-sm text-white">{{ order.size }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-400">Units</label>
                    <p class="mt-1 text-sm text-white">{{ order.units }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-400">Price per Unit</label>
                    <p class="mt-1 text-sm text-white">${{ formatNumber(order.invoice_to_doc / order.units) }}</p>
                  </div>
                </div>
              </div>

              <!-- Commission Info -->
              <div class="pt-4 border-t border-gray-700">
                <h4 class="text-sm font-medium text-gray-400">Commission Information</h4>
                <div class="mt-2 space-y-2">
                  <div v-if="order.master_rep_id">
                    <label class="block text-sm font-medium text-gray-400">Master Rep Commission</label>
                    <p class="mt-1 text-sm text-white">${{ formatNumber(calculateCommission('master')) }}</p>
                  </div>
                  <div v-if="order.sub_rep_id">
                    <label class="block text-sm font-medium text-gray-400">Sub Rep Commission</label>
                    <p class="mt-1 text-sm text-white">${{ formatNumber(calculateCommission('sub')) }}</p>
                  </div>
                  <div v-if="order.sub_sub_rep_id">
                    <label class="block text-sm font-medium text-gray-400">Sub-Sub Rep Commission</label>
                    <p class="mt-1 text-sm text-white">${{ formatNumber(calculateCommission('sub_sub')) }}</p>
                  </div>
                  <div>
                    <label class="block text-sm font-medium text-gray-400">MSC Commission</label>
                    <p class="mt-1 text-sm text-white">${{ formatNumber(order.msc_commission || 0) }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
          <button
            type="button"
            class="inline-flex justify-center w-full px-4 py-2 text-base font-medium text-white bg-indigo-600 border border-transparent rounded-md shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
            @click="$emit('close')"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Order } from '@/types/models';

const props = defineProps<{
  order: Order;
}>();

defineEmits<{
  (e: 'close'): void;
}>();

const formatDate = (date: string): string => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};

const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
};

const getStatusClass = (status: string): string => {
  const classes = {
    paid: 'px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300',
    partial: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-900 text-yellow-300',
    outstanding: 'px-2 py-1 text-xs font-medium rounded-full bg-red-900 text-red-300'
  };
  return classes[status as keyof typeof classes] || '';
};

const calculateCommission = (type: 'master' | 'sub' | 'sub_sub'): number => {
  const structure = props.order.commission_structure || {};
  const rate = structure[type] || 0;
  return (props.order.invoice_to_doc * rate) / 100;
};
</script>
