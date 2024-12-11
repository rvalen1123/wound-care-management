import { defineStore } from 'pinia';
import type { Order, Product } from '@/types/models';
import { supabase } from '../utils/supabase';
import { useAuthStore } from '@/stores/auth';
import { useRepStore } from '@/stores/repStore';
import { ref, computed } from 'vue';

interface OrderState {
  orders: Order[];
  loading: boolean;
  error: string | null;
}

export const useOrderStore = defineStore('orders', () => {
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getOrderById = computed(() => {
    return (id: string) => orders.value.find((order: Order) => order.id === id);
  });

  const getOrdersByStatus = computed(() => {
    return (status: string) => {
      return orders.value.filter((order: Order) => {
        if (status === 'all') return true;
        return order.status === status;
      });
    };
  });

  // Actions
  async function fetchOrders() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      orders.value = data || [];
    } catch (err) {
      console.error('Error fetching orders:', err);
      error.value = 'Failed to fetch orders';
    } finally {
      loading.value = false;
    }
  }

  async function createOrder(orderData: Partial<Order>) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('orders')
        .insert([orderData])
        .select()
        .single();

      if (err) throw err;

      if (data) {
        orders.value.unshift(data);
      }

      return data;
    } catch (err) {
      console.error('Error creating order:', err);
      error.value = 'Failed to create order';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateOrder(id: string, updates: Partial<Order>) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('orders')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;

      if (data) {
        const index = orders.value.findIndex((order: Order) => order.id === id);
        if (index !== -1) {
          orders.value[index] = { ...orders.value[index], ...data };
        }
      }

      return data;
    } catch (err) {
      console.error('Error updating order:', err);
      error.value = 'Failed to update order';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteOrder(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const { error: err } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (err) throw err;

      orders.value = orders.value.filter((order: Order) => order.id !== id);
    } catch (err) {
      console.error('Error deleting order:', err);
      error.value = 'Failed to delete order';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function calculateOrderValues({ 
    product, 
    units 
  }: { 
    product: Product; 
    units: number 
  }) {
    const asp = product.national_asp || 0;
    const invoiceAmount = asp * units;
    const mscCommission = invoiceAmount * 0.15; // 15% commission
    
    const today = new Date();
    const expectedCollectionDate = new Date(today.setDate(today.getDate() + 60));

    return {
      invoiceAmount,
      mscCommission,
      expectedCollectionDate
    };
  }

  function calculateCommissionStructure({
    mscCommission,
    masterRepId,
    subRepId,
    subSubRepId
  }: {
    mscCommission: number;
    masterRepId: string | null;
    subRepId: string | null;
    subSubRepId: string | null;
  }) {
    const repStore = useRepStore();
    const structure = {
      master: 0,
      sub: 0,
      subSub: 0
    };

    if (!masterRepId) return structure;

    // Calculate master rep commission (60% of MSC commission)
    structure.master = mscCommission * 0.6;

    if (subRepId) {
      // Sub rep gets 40% of master's commission
      structure.sub = structure.master * 0.4;
      // Adjust master's commission
      structure.master = structure.master * 0.6;

      if (subSubRepId) {
        // Sub-sub rep gets 30% of sub's commission
        structure.subSub = structure.sub * 0.3;
        // Adjust sub's commission
        structure.sub = structure.sub * 0.7;
      }
    }

    return structure;
  }

  return {
    orders,
    loading,
    error,
    getOrderById,
    getOrdersByStatus,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    calculateOrderValues,
    calculateCommissionStructure
  };
});
