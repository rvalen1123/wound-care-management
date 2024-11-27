<template>
  <div class="customer-management">
    <h1 class="text-2xl font-bold mb-6 text-green-700">Customer Management</h1>
    
    <!-- Customer Creation Form -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Add New Customer</h2>
      <form @submit.prevent="createCustomer" class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label class="block mb-2">Name</label>
          <input 
            type="text" 
            v-model="newCustomer.name" 
            class="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label class="block mb-2">Email</label>
          <input 
            type="email" 
            v-model="newCustomer.email" 
            class="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label class="block mb-2">Phone</label>
          <input 
            type="tel" 
            v-model="newCustomer.phone" 
            class="w-full p-2 border rounded"
            required
          />
        </div>
        
        <div>
          <label class="block mb-2">Type</label>
          <select v-model="newCustomer.type" class="w-full p-2 border rounded" required>
            <option value="hospital">Hospital</option>
            <option value="clinic">Clinic</option>
            <option value="doctor">Individual Doctor</option>
          </select>
        </div>
        
        <div class="col-span-full">
          <button type="submit" class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700">
            Add Customer
          </button>
        </div>
      </form>
    </div>

    <!-- Customers Table -->
    <div class="bg-white shadow-md rounded-lg">
      <h2 class="text-xl font-semibold p-6 pb-0">Customer List</h2>
      <div class="overflow-x-auto">
        <table class="w-full">
          <thead>
            <tr class="bg-gray-100">
              <th class="p-4 text-left">ID</th>
              <th class="p-4 text-left">Name</th>
              <th class="p-4 text-left">Email</th>
              <th class="p-4 text-left">Phone</th>
              <th class="p-4 text-left">Type</th>
              <th class="p-4 text-left">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="customer in customers" :key="customer.id" class="border-t">
              <td class="p-4">{{ customer.id }}</td>
              <td class="p-4">{{ customer.name }}</td>
              <td class="p-4">{{ customer.email }}</td>
              <td class="p-4">{{ customer.phone }}</td>
              <td class="p-4">{{ customer.type }}</td>
              <td class="p-4">
                <button 
                  @click="editCustomer(customer)"
                  class="text-blue-600 hover:text-blue-800 mr-2"
                >
                  Edit
                </button>
                <button 
                  @click="deleteCustomer(customer.id)"
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

<script>
import { mapState, mapActions } from 'vuex'

export default {
  name: 'CustomerManagement',
  data() {
    return {
      newCustomer: {
        name: '',
        email: '',
        phone: '',
        type: 'hospital'
      }
    }
  },
  computed: {
    ...mapState({
      customers: state => state.customers
    })
  },
  methods: {
    ...mapActions(['createCustomer', 'updateCustomer', 'deleteCustomer']),
    
    async createCustomer() {
      try {
        await this.$store.dispatch('createCustomer', {
          ...this.newCustomer,
          id: Date.now() // Temporary ID generation
        })
        
        // Reset form
        this.newCustomer = {
          name: '',
          email: '',
          phone: '',
          type: 'hospital'
        }
      } catch (error) {
        console.error('Error creating customer:', error)
      }
    },
    
    editCustomer(customer) {
      // Implementation for editing customer
      console.log('Edit customer:', customer)
    },
    
    async deleteCustomer(customerId) {
      if (confirm('Are you sure you want to delete this customer?')) {
        try {
          await this.$store.dispatch('deleteCustomer', customerId)
        } catch (error) {
          console.error('Error deleting customer:', error)
        }
      }
    }
  },
  created() {
    // Fetch customers on component creation
    this.$store.dispatch('fetchCustomers')
  }
}
</script>

<style scoped>
.customer-management {
  background-color: #f4f7f6;
  padding: 2rem;
}
</style>
