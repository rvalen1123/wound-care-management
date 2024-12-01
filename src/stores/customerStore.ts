import { defineStore } from 'pinia';
import { ref } from 'vue';
import { supabase } from '@/lib/supabaseClient';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'hospital' | 'clinic' | 'doctor';
}

export const useCustomerStore = defineStore('customers', () => {
  const customers = ref<Customer[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCustomers() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('customers')
        .select('*')
        .order('name');

      if (err) throw err;

      customers.value = data || [];
    } catch (err) {
      console.error('Error fetching customers:', err);
      error.value = 'Failed to fetch customers';
    } finally {
      loading.value = false;
    }
  }

  async function createCustomer(customer: Omit<Customer, 'id'>) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('customers')
        .insert([customer])
        .select()
        .single();

      if (err) throw err;

      if (data) {
        customers.value.push(data as Customer);
      }

      return data;
    } catch (err) {
      console.error('Error creating customer:', err);
      error.value = 'Failed to create customer';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCustomer(id: string, updates: Partial<Customer>) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('customers')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;

      if (data) {
        const index = customers.value.findIndex((customer: Customer) => customer.id === id);
        if (index !== -1) {
          customers.value[index] = { ...customers.value[index], ...data } as Customer;
        }
      }

      return data;
    } catch (err) {
      console.error('Error updating customer:', err);
      error.value = 'Failed to update customer';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCustomer(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const { error: err } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);

      if (err) throw err;

      customers.value = customers.value.filter((customer: Customer) => customer.id !== id);
    } catch (err) {
      console.error('Error deleting customer:', err);
      error.value = 'Failed to delete customer';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  return {
    customers,
    loading,
    error,
    fetchCustomers,
    createCustomer,
    updateCustomer,
    deleteCustomer
  };
});
