<template>
  <div class="payment-tracking">
    <h1 class="text-2xl font-bold mb-6 text-green-700">Payment Tracking</h1>
    
    <!-- Payment Summary Cards -->
    <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2">Total Receivables</h2>
        <p class="text-3xl font-bold text-green-600">${{ formatNumber(totalReceivables) }}</p>
        <div class="mt-2 text-sm">
          <span class="text-gray-500">Due within 30 days:</span>
          <span class="text-green-600 font-semibold">${{ formatNumber(due30Days) }}</span>
        </div>
      </div>
      
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2">Overdue Payments</h2>
        <p class="text-3xl font-bold text-red-600">${{ formatNumber(overdueAmount) }}</p>
        <div class="mt-2 text-sm">
          <span class="text-gray-500">Number of invoices:</span>
          <span class="text-red-600 font-semibold">{{ overdueCount }}</span>
        </div>
      </div>
      
      <div class="bg-white shadow-md rounded-lg p-6">
        <h2 class="text-lg font-semibold mb-2">Paid This Month</h2>
        <p class="text-3xl font-bold text-blue-600">${{ formatNumber(paidThisMonth) }}</p>
        <div class="mt-2 text-sm">
          <span class="text-gray-500">Number of payments:</span>
          <span class="text-blue-600 font-semibold">{{ paymentsThisMonth }}</span>
        </div>
      </div>
    </div>

    <!-- Payment Actions -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-8">
      <div class="flex justify-between items-center mb-4">
        <h2 class="text-xl font-semibold">Record Payment</h2>
      </div>
      <form @submit.prevent="recordPayment" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block mb-2">Invoice Number</label>
          <input 
            type="text" 
            v-model="newPayment.invoiceNumber" 
            class="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label class="block mb-2">Amount</label>
          <input 
            type="number" 
            v-model="newPayment.amount" 
            class="w-full p-2 border rounded"
            step="0.01"
            required
          />
        </div>
        
        <div>
          <label class="block mb-2">Payment Date</label>
          <input 
            type="date" 
            v-model="newPayment.date" 
            class="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div class="col-span-full">
          <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Record Payment
          </button>
        </div>
      </form>
    </div>

    <!-- Payment History -->
    <div class="bg-white shadow-md rounded-lg">
      <div class="flex justify-between items-center p-6 pb-0">
        <h2 class="text-xl font-semibold">Payment History</h2>
        <div class="flex gap-2">
          <button class="text-green-600 hover:text-green-700" @click="exportPayments">
            Export CSV
          </button>
        </div>
      </div>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-4 text-left">Date</th>
              <th class="p-4 text-left">Invoice #</th>
              <th class="p-4 text-left">Customer</th>
              <th class="p-4 text-left">Amount</th>
              <th class="p-4 text-left">Status</th>
              <th class="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="payment in payments" :key="payment.id" class="border-t">
              <td class="p-4">{{ formatDate(payment.date) }}</td>
              <td class="p-4">{{ payment.invoiceNumber }}</td>
              <td class="p-4">{{ payment.customerName }}</td>
              <td class="p-4">${{ formatNumber(payment.amount) }}</td>
              <td class="p-4">
                <span :class="getStatusClass(payment.status)">
                  {{ payment.status }}
                </span>
              </td>
              <td class="p-4">
                <button 
                  @click="viewPaymentDetails(payment)"
                  class="text-blue-600 hover:text-blue-800 mr-2"
                >
                  View
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'PaymentTracking',
  data() {
    return {
      totalReceivables: 150000,
      due30Days: 75000,
      overdueAmount: 25000,
      overdueCount: 5,
      paidThisMonth: 45000,
      paymentsThisMonth: 12,
      
      newPayment: {
        invoiceNumber: '',
        amount: null,
        date: new Date().toISOString().split('T')[0]
      },
      
      payments: [
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
        'paid': 'text-green-600',
        'pending': 'text-yellow-600',
        'overdue': 'text-red-600'
      }[status] || 'text-gray-600'
    },
    
    recordPayment() {
      // Implementation for recording a new payment
      console.log('Recording payment:', this.newPayment)
      this.newPayment = {
        invoiceNumber: '',
        amount: null,
        date: new Date().toISOString().split('T')[0]
      }
    },
    
    viewPaymentDetails(payment) {
      // Implementation for viewing payment details
      console.log('Viewing payment details:', payment)
    },
    
    exportPayments() {
      // Implementation for exporting payments to CSV
      console.log('Exporting payments to CSV')
    }
  },
  created() {
    // Fetch payment data
    // this.$store.dispatch('fetchPayments')
  }
}
</script>

<style scoped>
.payment-tracking {
  background-color: #f4f7f6;
  padding: 2rem;
}
</style>
