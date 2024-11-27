<template>
  <div class="graft-order-management">
    <h1 class="text-2xl font-bold mb-6 text-green-700">Graft Order Management</h1>
    
    <!-- Order Creation Form -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Create New Graft Order</h2>
      <form @submit.prevent="createOrder" class="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label class="block mb-2">Customer</label>
          <select v-model="newOrder.customerId" class="w-full p-2 border rounded">
            <option v-for="customer in customers" :key="customer.id" :value="customer.id">
              {{ customer.name }}
            </option>
          </select>
        </div>
        
        <div>
          <label class="block mb-2">Graft Type</label>
          <select v-model="newOrder.graftType" class="w-full p-2 border rounded">
            <option value="skin">Skin Graft</option>
            <option value="bone">Bone Graft</option>
            <option value="tissue">Tissue Graft</option>
          </select>
        </div>
        
        <div>
          <label class="block mb-2">Quantity</label>
          <input 
            type="number" 
            v-model="newOrder.quantity" 
            class="w-full p-2 border rounded"
            min="1"
          />
        </div>
        
        <div class="col-span-full">
          <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Create Order
          </button>
        </div>
      </form>
    </div>

    <!-- Orders Table -->
    <div class="bg-white shadow-md rounded-lg">
      <h2 class="text-xl font-semibold p-6 pb-0">Current Orders</h2>
      <table class="w-full">
        <thead>
          <tr class="bg-gray-100">
            <th class="p-4 text-left">Order ID</th>
            <th class="p-4 text-left">Customer</th>
            <th class="p-4 text-left">Graft Type</th>
            <th class="p-4 text-left">Quantity</th>
            <th class="p-4 text-left">Status</th>
            <th class="p-4 text-left">Actions</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="order in orders" :key="order.id" class="border-t">
            <td class="p-4">{{ order.id }}</td>
            <td class="p-4">{{ order.customerName }}</td>
            <td class="p-4">{{ order.graftType }}</td>
            <td class="p-4">{{ order.quantity }}</td>
            <td class="p-4">
              <span :class="getStatusClass(order.status)">
                {{ order.status }}
              </span>
            </td>
            <td class="p-4">
              <select 
                @change="updateOrderStatus(order.id, $event.target.value)"
                class="p-2 border rounded"
              >
                <option value="pending">Pending</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="completed">Completed</option>
              </select>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'GraftOrderManagement',
  data() {
    return {
      newOrder: {
        customerId: null,
        graftType: '',
        quantity: 1
      }
    }
  },
  computed: {
    ...mapState({
      orders: state => state.orders,
      customers: state => state.customers
    })
  },
  methods: {
    ...mapActions(['createOrder', 'updateOrderStatus']),
    
    createOrder() {
      if (!this.newOrder.customerId || !this.newOrder.graftType) {
        alert('Please fill in all required fields')
        return
      }
      
      this.$store.dispatch('createOrder', {
        ...this.newOrder,
        status: 'pending',
        id: Date.now() // Temporary ID generation
      })
      
      // Reset form
      this.newOrder = {
        customerId: null,
        graftType: '',
        quantity: 1
      }
    },
    
    updateOrderStatus(orderId, status) {
      this.$store.dispatch('updateOrderStatus', { orderId, status })
    },
    
    getStatusClass(status) {
      const statusClasses = {
        'pending': 'text-yellow-600',
        'processing': 'text-blue-600',
        'shipped': 'text-purple-600',
        'completed': 'text-green-600'
      }
      return statusClasses[status] || 'text-gray-600'
    }
  },
  created() {
    // Fetch customers and orders
    this.$store.dispatch('fetchCustomers')
    this.$store.dispatch('fetchOrders')
  }
}
</script>

<style scoped>
.graft-order-management {
  background-color: #f4f7f6;
  padding: 2rem;
}
</style>
