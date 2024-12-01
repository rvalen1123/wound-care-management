<template>
  <div class="p-4">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Orders</h1>
      <router-link 
        to="/orders/new"
        class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
      >
        Create New Order
      </router-link>
    </div>

    <div class="bg-white shadow-md rounded-lg">
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-4 text-left">Order ID</th>
              <th class="p-4 text-left">Doctor</th>
              <th class="p-4 text-left">Product</th>
              <th class="p-4 text-left">Date</th>
              <th class="p-4 text-left">Status</th>
              <th class="p-4 text-left">Amount</th>
              <th class="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="order in orderStore.orders" :key="order.id" class="border-t">
              <td class="p-4">{{ order.id }}</td>
              <td class="p-4">{{ getDoctorName(order.doctor_id) }}</td>
              <td class="p-4">{{ getProductName(order.product_id) }}</td>
              <td class="p-4">{{ formatDate(order.date_of_service) }}</td>
              <td class="p-4">
                <span 
                  class="px-2 py-1 rounded text-sm"
                  :class="{
                    'bg-green-100 text-green-800': order.status === 'completed',
                    'bg-yellow-100 text-yellow-800': order.status === 'pending',
                    'bg-red-100 text-red-800': order.status === 'cancelled'
                  }"
                >
                  {{ order.status }}
                </span>
              </td>
              <td class="p-4">{{ formatCurrency(order.invoice_to_doc) }}</td>
              <td class="p-4">
                <router-link 
                  :to="`/orders/${order.id}/edit`"
                  class="text-blue-600 hover:text-blue-800 mr-2"
                >
                  Edit
                </router-link>
                <button 
                  @click="handleDeleteOrder(order.id)"
                  class="text-red-600 hover:text-red-800"
                >
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useOrderStore } from '@/stores/orderStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useProductStore } from '@/stores/productStore';
import { format } from 'date-fns';
import type { Doctor } from '@/types/models';
import type { Product } from '@/types/models';

const orderStore = useOrderStore();
const doctorStore = useDoctorStore();
const productStore = useProductStore();

function getDoctorName(doctorId: string) {
  const doctor = doctorStore.doctors.find((d: Doctor) => d.id === doctorId);
  return doctor?.name || 'Unknown Doctor';
}

function getProductName(productId: string) {
  const product = productStore.products.find((p: Product) => p.id === productId);
  return product?.name || 'Unknown Product';
}

function formatDate(date: string) {
  return format(new Date(date), 'MMM dd, yyyy');
}

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

async function handleDeleteOrder(orderId: string) {
  if (confirm('Are you sure you want to delete this order?')) {
    try {
      await orderStore.deleteOrder(orderId);
    } catch (error) {
      console.error('Error deleting order:', error);
    }
  }
}

onMounted(async () => {
  await Promise.all([
    orderStore.fetchOrders(),
    doctorStore.fetchDoctors(),
    productStore.fetchProducts()
  ]);
});
</script>
