<template>
  <Layout
    title="Payment Tracking"
    :loading="loading"
    :error="error"
  >
    <!-- Payment Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2 text-gray-300">Total Receivables</h2>
        <p class="text-3xl font-bold text-white">${{ formatNumber(totalReceivables) }}</p>
        <div class="mt-2 text-sm">
          <span class="text-gray-400">Due within 30 days:</span>
          <span class="text-green-400 font-semibold">${{ formatNumber(due30Days) }}</span>
        </div>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2 text-gray-300">Overdue Payments</h2>
        <p class="text-3xl font-bold text-white">${{ formatNumber(overdueAmount) }}</p>
        <div class="mt-2 text-sm">
          <span class="text-gray-400">Number of invoices:</span>
          <span class="text-red-400 font-semibold">{{ overdueCount }}</span>
        </div>
      </div>
      
      <div class="bg-gray-800 rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2 text-gray-300">Paid This Month</h2>
        <p class="text-3xl font-bold text-white">${{ formatNumber(paidThisMonth) }}</p>
        <div class="mt-2 text-sm">
          <span class="text-gray-400">Number of payments:</span>
          <span class="text-blue-400 font-semibold">{{ paymentsThisMonth }}</span>
        </div>
      </div>
    </div>

    <!-- Payment Actions -->
    <div class="bg-gray-800 rounded-lg p-6 mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold text-white">Record Payment</h2>
      </div>
      <form @submit.prevent="recordPayment" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block mb-2 text-gray-300">Invoice Number</label>
          <input 
            type="text" 
            v-model="newPayment.invoiceNumber" 
            class="w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div>
          <label class="block mb-2 text-gray-300">Amount</label>
          <input 
            type="number" 
            v-model="newPayment.amount" 
            class="w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label class="block mb-2 text-gray-300">Payment Date</label>
          <input 
            type="date" 
            v-model="newPayment.date" 
            class="w-full p-2 rounded-md bg-gray-700 border-gray-600 text-white focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>
        
        <div class="col-span-full">
          <button 
            type="submit" 
            class="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            :disabled="loading"
          >
            {{ loading ? 'Recording...' : 'Record Payment' }}
          </button>
        </div>
      </form>
    </div>

    <!-- Payment History -->
    <div class="bg-gray-800 rounded-lg">
      <div class="flex justify-between items-center p-6 pb-0">
        <h2 class="text-xl font-semibold text-white">Payment History</h2>
        <div class="flex gap-2">
          <button 
            class="text-indigo-400 hover:text-indigo-300" 
            @click="exportPayments"
          >
            Export CSV
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="min-w-full divide-y divide-gray-700">
          <thead>
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Invoice #</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Amount</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Status</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-400 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-700">
            <tr v-for="payment in payments" :key="payment.id" class="hover:bg-gray-700">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ formatDate(payment.date) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ payment.invoiceNumber }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                {{ payment.customerName }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                ${{ formatNumber(payment.amount) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <span :class="getStatusClass(payment.status)">
                  {{ payment.status }}
                </span>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm">
                <button 
                  @click="viewPaymentDetails(payment)"
                  class="text-indigo-400 hover:text-indigo-300"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </Layout>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import Layout from '@/components/common/ui/Layout.vue';

interface Payment {
  id: number;
  date: Date;
  invoiceNumber: string;
  customerName: string;
  amount: number;
  status: 'paid' | 'pending' | 'overdue';
}

interface NewPayment {
  invoiceNumber: string;
  amount: number | null;
  date: string;
}

const loading = ref(false);
const error = ref<string | null>(null);
const totalReceivables = ref(150000);
const due30Days = ref(75000);
const overdueAmount = ref(25000);
const overdueCount = ref(5);
const paidThisMonth = ref(45000);
const paymentsThisMonth = ref(12);

const newPayment = ref<NewPayment>({
  invoiceNumber: '',
  amount: null,
  date: new Date().toISOString().split('T')[0]
});

const payments = ref<Payment[]>([
  {
    id: 1,
    date: new Date('2024-01-15'),
    invoiceNumber: 'INV-001',
    customerName: 'City Hospital',
    amount: 5000,
    status: 'paid'
  },
  {
    id: 2,
    date: new Date('2024-01-14'),
    invoiceNumber: 'INV-002',
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
    paid: 'px-2 py-1 text-xs font-medium rounded-full bg-green-900 text-green-300',
    pending: 'px-2 py-1 text-xs font-medium rounded-full bg-yellow-900 text-yellow-300',
    overdue: 'px-2 py-1 text-xs font-medium rounded-full bg-red-900 text-red-300'
  };
  return classes[status as keyof typeof classes] || '';
};

const recordPayment = async () => {
  try {
    loading.value = true;
    error.value = null;
    
    // TODO: Implement payment recording logic
    console.log('Recording payment:', newPayment.value);
    
    // Reset form
    newPayment.value = {
      invoiceNumber: '',
      amount: null,
      date: new Date().toISOString().split('T')[0]
    };
  } catch (err) {
    console.error('Error recording payment:', err);
    error.value = 'Failed to record payment';
  } finally {
    loading.value = false;
  }
};

const viewPaymentDetails = (payment: Payment) => {
  // TODO: Implement payment details view
  console.log('Viewing payment details:', payment);
};

const exportPayments = () => {
  // TODO: Implement CSV export
  console.log('Exporting payments to CSV');
};
</script>
