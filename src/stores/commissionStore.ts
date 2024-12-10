import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import type { Order, CommissionAuditLog } from '../types/models';

export const useCommissionStore = defineStore('commission', () => {
  // State
  const pendingOrders = ref<Order[]>([]);
  const auditLogs = ref<CommissionAuditLog[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getPendingCommissions = computed(() => 
    pendingOrders.value.filter((order: Order) => !order.msc_commission)
  );

  const getTotalCommission = computed(() => 
    pendingOrders.value.reduce((sum: number, order: Order) => 
      sum + (order.msc_commission || 0), 
      0
    )
  );

  // Actions
  async function fetchPendingOrders() {
    loading.value = true;
    try {
      const { data, error: queryError } = await supabase
        .from('orders')
        .select(`
          *,
          doctor:doctor_id(*),
          master_rep:master_rep_id(*),
          sub_rep:sub_rep_id(*),
          sub_sub_rep:sub_sub_rep_id(*)
        `)
        .is('msc_commission', null)
        .eq('status', 'pending');

      if (queryError) throw queryError;
      pendingOrders.value = data || [];
    } catch (err) {
      console.error('Error fetching pending orders:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch pending orders';
    } finally {
      loading.value = false;
    }
  }

  async function approveCommission(orderId: string, commissionData: any) {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          commission_structure: commissionData,
          msc_commission: commissionData.total,
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (updateError) throw updateError;

      // Create commission payments
      if (commissionData.splits) {
        const payments = commissionData.splits.map((split: any) => ({
          order_id: orderId,
          rep_id: split.rep_id,
          amount: split.amount,
          payment_date: new Date().toISOString()
        }));

        const { error: paymentsError } = await supabase
          .from('commission_payments')
          .insert(payments);

        if (paymentsError) throw paymentsError;
      }

      await fetchPendingOrders();
    } catch (err) {
      console.error('Error approving commission:', err);
      error.value = err instanceof Error ? err.message : 'Failed to approve commission';
    }
  }

  async function rejectCommission(orderId: string, notes: string) {
    try {
      const { error: updateError } = await supabase
        .from('orders')
        .update({
          status: 'rejected',
          commission_structure: { notes }
        })
        .eq('order_id', orderId);

      if (updateError) throw updateError;

      await fetchPendingOrders();
    } catch (err) {
      console.error('Error rejecting commission:', err);
      error.value = err instanceof Error ? err.message : 'Failed to reject commission';
    }
  }

  async function fetchAuditLogs(orderId: string) {
    loading.value = true;
    try {
      const { data, error: queryError } = await supabase
        .from('commission_audit_logs')
        .select('*')
        .eq('structure_id', orderId)
        .order('changed_at', { ascending: false });

      if (queryError) throw queryError;
      auditLogs.value = data || [];
    } catch (err) {
      console.error('Error fetching audit logs:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch audit logs';
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    pendingOrders,
    auditLogs,
    loading,
    error,
    // Getters
    getPendingCommissions,
    getTotalCommission,
    // Actions
    fetchPendingOrders,
    approveCommission,
    rejectCommission,
    fetchAuditLogs,
    clearError
  };
});
