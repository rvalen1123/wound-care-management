import { defineStore } from 'pinia';
import type { Order, Product, CommissionCalculation } from '../types/models';
import { supabase } from '../lib/supabaseClient';
import { useAuthStore } from './auth';
import { commissionService } from '../services/commission.service';
import { ref, computed } from 'vue';

type RequiredOrderFields = 'doctor_id' | 'product_id' | 'date_of_service' | 'size' | 'units' | 'master_rep_id';

export const useOrderStore = defineStore('orders', () => {
  const orders = ref<Order[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const lastCreatedOrder = ref<Order | null>(null);

  // Getters
  const getOrderById = computed(() => {
    return (id: string) => orders.value.find((order: Order) => order.order_id === id);
  });

  const getOrdersByStatus = computed(() => {
    return (status: string) => {
      return orders.value.filter((order: Order) => {
        if (status === 'all') return true;
        return order.payment_status === status;
      });
    };
  });

  // Actions
  async function fetchOrders() {
    loading.value = true;
    error.value = null;

    try {
      const authStore = useAuthStore();
      let query = supabase
        .from('orders')
        .select(`
          *,
          doctor:doctor_id(*),
          product:product_id(*),
          master_rep:master_rep_id(*),
          sub_rep:sub_rep_id(*),
          sub_sub_rep:sub_sub_rep_id(*)
        `);

      // Filter orders based on user role
      if (authStore.isRep) {
        query = query.or(`master_rep_id.eq.${authStore.user?.id},sub_rep_id.eq.${authStore.user?.id},sub_sub_rep_id.eq.${authStore.user?.id}`);
      } else if (authStore.isDoctor) {
        query = query.eq('doctor_id', authStore.user?.id);
      }

      const { data, error: err } = await query.order('created_at', { ascending: false });

      if (err) throw err;

      orders.value = data || [];
    } catch (err) {
      console.error('Error fetching orders:', err);
      error.value = 'Failed to fetch orders';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  function validateRequiredFields(orderData: Partial<Order>): string[] {
    const requiredFields: RequiredOrderFields[] = ['doctor_id', 'product_id', 'date_of_service', 'size', 'units', 'master_rep_id'];
    return requiredFields.filter(field => !orderData[field]);
  }

  async function createOrder(orderData: Partial<Order>) {
    loading.value = true;
    error.value = null;
    lastCreatedOrder.value = null;

    try {
      // Validate required fields
      const missingFields = validateRequiredFields(orderData);
      if (missingFields.length > 0) {
        throw new Error(`Missing required fields: ${missingFields.join(', ')}`);
      }

      // Calculate commission structure
      const commissionStructure = commissionService.calculateCommissionStructure(
        orderData.invoice_to_doc || 0,
        orderData.master_rep_id || null,
        orderData.sub_rep_id || null,
        orderData.sub_sub_rep_id || null
      );

      // Add audit fields and commission structure
      const authStore = useAuthStore();
      const enrichedData = {
        ...orderData,
        commission_structure: commissionStructure,
        created_by: authStore.user?.id,
        created_at: new Date().toISOString(),
        payment_status: 'pending'
      };

      const { data, error: err } = await supabase
        .from('orders')
        .insert([enrichedData])
        .select()
        .single();

      if (err) {
        if (err.code === '23505') { // Unique constraint violation
          throw new Error('An order with these details already exists');
        }
        throw err;
      }

      if (data) {
        orders.value.unshift(data);
        lastCreatedOrder.value = data;
      }

      return data;
    } catch (err) {
      console.error('Error creating order:', err);
      error.value = err instanceof Error ? err.message : 'Failed to create order';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateOrder(id: string, updates: Partial<Order>) {
    loading.value = true;
    error.value = null;

    try {
      // Recalculate commission structure if necessary fields changed
      if (updates.invoice_to_doc || updates.master_rep_id || updates.sub_rep_id || updates.sub_sub_rep_id) {
        const order = orders.value.find((o: Order) => o.order_id === id);
        if (order) {
          const commissionStructure = commissionService.calculateCommissionStructure(
            updates.invoice_to_doc || order.invoice_to_doc,
            updates.master_rep_id || order.master_rep_id,
            updates.sub_rep_id || order.sub_rep_id,
            updates.sub_sub_rep_id || order.sub_sub_rep_id
          );
          updates.commission_structure = commissionStructure;
        }
      }

      // Add audit fields
      const authStore = useAuthStore();
      const enrichedUpdates = {
        ...updates,
        updated_by: authStore.user?.id,
        updated_at: new Date().toISOString()
      };

      const { data, error: err } = await supabase
        .from('orders')
        .update(enrichedUpdates)
        .eq('order_id', id)
        .select()
        .single();

      if (err) throw err;

      if (data) {
        const index = orders.value.findIndex((order: Order) => order.order_id === id);
        if (index !== -1) {
          orders.value[index] = { ...orders.value[index], ...data };
        }
      }

      return data;
    } catch (err) {
      console.error('Error updating order:', err);
      error.value = err instanceof Error ? err.message : 'Failed to update order';
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
        .eq('order_id', id);

      if (err) throw err;

      orders.value = orders.value.filter((order: Order) => order.order_id !== id);
    } catch (err) {
      console.error('Error deleting order:', err);
      error.value = err instanceof Error ? err.message : 'Failed to delete order';
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
    // Use precise calculations with rounding to 2 decimal places
    const asp = Number(product['National ASP']) || 0;
    const invoiceAmount = Math.round((asp * units) * 100) / 100;
    const mscCommission = Math.round((invoiceAmount * 0.15) * 100) / 100; // 15% commission
    
    const today = new Date();
    const expectedCollectionDate = new Date(today.setDate(today.getDate() + 60));

    return {
      invoiceAmount,
      mscCommission,
      expectedCollectionDate
    };
  }

  function clearError() {
    error.value = null;
  }

  return {
    orders,
    loading,
    error,
    lastCreatedOrder,
    getOrderById,
    getOrdersByStatus,
    fetchOrders,
    createOrder,
    updateOrder,
    deleteOrder,
    calculateOrderValues,
    clearError
  };
});
