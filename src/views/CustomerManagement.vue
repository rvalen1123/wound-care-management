<template>
  <div class="customer-management">
    <h1 class="text-2xl font-bold mb-6 text-green-700">Customer Management</h1>
    
    <!-- Customer Creation Form -->
    <div class="bg-white shadow-md rounded-lg p-6 mb-6">
      <h2 class="text-xl font-semibold mb-4">Add New Customer</h2>
      <form @submit.prevent="handleCreateCustomer" class="grid grid-cols-1 md:grid-cols-2 gap-4">
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
          <button 
            type="submit" 
            class="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
            :disabled="customerStore.loading"
          >
            {{ customerStore.loading ? 'Adding...' : 'Add Customer' }}
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
            <tr v-for="customer in customerStore.customers" :key="customer.id" class="border-t">
              <td class="p-4">{{ customer.id }}</td>
              <td class="p-4">{{ customer.name }}</td>
              <td class="p-4">{{ customer.email }}</td>
              <td class="p-4">{{ customer.phone }}</td>
              <td class="p-4">{{ customer.type }}</td>
              <td class="p-4">
                <button 
                  @click="handleEditCustomer(customer)"
                  class="text-blue-600 hover:text-blue-800 mr-2"
                >
                  Edit
                </button>
                <button 
                  @click="handleDeleteCustomer(customer.id)"
                  class="text-red-600 hover:text-red-800"
                  :disabled="customerStore.loading"
                >
                  {{ customerStore.loading ? 'Deleting...' : 'Delete' }}
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
import { ref, onMounted } from 'vue';
import { useCustomerStore } from '@/stores/customerStore';

const customerStore = useCustomerStore();

interface NewCustomer {
  name: string;
  email: string;
  phone: string;
  type: 'hospital' | 'clinic' | 'doctor';
}

const newCustomer = ref<NewCustomer>({
  name: '',
  email: '',
  phone: '',
  type: 'hospital'
});

async function handleCreateCustomer() {
  try {
    await customerStore.createCustomer(newCustomer.value);
    
    // Reset form
    newCustomer.value = {
      name: '',
      email: '',
      phone: '',
      type: 'hospital'
    };
  } catch (error) {
    console.error('Error creating customer:', error);
  }
}

function handleEditCustomer(customer: any) {
  // Implementation for editing customer
  console.log('Edit customer:', customer);
}

async function handleDeleteCustomer(customerId: string) {
  if (confirm('Are you sure you want to delete this customer?')) {
    try {
      await customerStore.deleteCustomer(customerId);
    } catch (error) {
      console.error('Error deleting customer:', error);
    }
  }
}

onMounted(() => {
  customerStore.fetchCustomers();
});
</script>

<style scoped>
.customer-management {
  background-color: #f4f7f6;
  padding: 2rem;
}
</style>
