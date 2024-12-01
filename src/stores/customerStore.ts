import { defineStore } from 'pinia';
import { supabase } from '@/lib/supabaseClient';
import { ref } from 'vue';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'hospital' | 'clinic' | 'doctor';
  created_at: string;
  updated_at?: string;
}

interface NewCustomer {
  name: string;
  email: string;
  phone: string;
  type: 'hospital' | 'clinic' | 'doctor';
}

export const useCustomerStore = defineStore('customer', () => {
  const customers = ref<Customer[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  async function fetchCustomers() {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: supabaseError } = await supabase
        .from('doctors')
        .select('*')
        .order('name');

      if (supabaseError) throw supabaseError;

      // Map the doctors data to our Customer interface
      customers.value = data.map((doctor: any) => ({
        id: doctor.id,
        name: doctor.name,
        email: doctor.email || '',
        phone: doctor.phone || '',
        type: doctor.business_name ? 'clinic' : 'doctor',
        created_at: doctor.created_at,
        updated_at: doctor.updated_at
      }));
    } catch (err) {
      console.error('Error fetching customers:', err);
      error.value = 'Failed to fetch customers';
    } finally {
      loading.value = false;
    }
  }

  async function createCustomer(customer: NewCustomer) {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: supabaseError } = await supabase
        .from('doctors')
        .insert([{
          name: customer.name,
          email: customer.email,
          phone: customer.phone,
          business_name: customer.type === 'doctor' ? null : customer.name
        }])
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Add the new customer to the state
      customers.value.push({
        id: data.id,
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        type: data.business_name ? 'clinic' : 'doctor',
        created_at: data.created_at,
        updated_at: data.updated_at
      });
    } catch (err) {
      console.error('Error creating customer:', err);
      error.value = 'Failed to create customer';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateCustomer(id: string, updates: Partial<NewCustomer>) {
    try {
      loading.value = true;
      error.value = null;

      const { data, error: supabaseError } = await supabase
        .from('doctors')
        .update({
          name: updates.name,
          email: updates.email,
          phone: updates.phone,
          business_name: updates.type === 'doctor' ? null : updates.name
        })
        .eq('id', id)
        .select()
        .single();

      if (supabaseError) throw supabaseError;

      // Update the customer in the state
      const index = customers.value.findIndex((customer: Customer) => customer.id === id);
      if (index !== -1) {
        customers.value[index] = {
          ...customers.value[index],
          ...updates,
          updated_at: data.updated_at
        };
      }
    } catch (err) {
      console.error('Error updating customer:', err);
      error.value = 'Failed to update customer';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteCustomer(id: string) {
    try {
      loading.value = true;
      error.value = null;

      const { error: supabaseError } = await supabase
        .from('doctors')
        .delete()
        .eq('id', id);

      if (supabaseError) throw supabaseError;

      // Remove the customer from the state
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
