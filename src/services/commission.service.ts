import { supabase } from '@/lib/supabaseClient';
import type { Order, Representative, CommissionCalculation } from '@/types/models';

export const commissionService = {
  /**
   * Calculate commission structure for an order
   */
  calculateCommissionStructure(
    orderAmount: number,
    masterRepId: string | null,
    subRepId: string | null,
    subSubRepId: string | null
  ): CommissionCalculation {
    const structure = {
      master: 0,
      sub: 0,
      subSub: 0,
      total: 0
    };

    if (!masterRepId || orderAmount <= 0) return structure;

    // Calculate base MSC commission (15% of order amount)
    const mscCommission = Math.round((orderAmount * 0.15) * 100) / 100;

    // Calculate master rep commission (60% of MSC commission)
    structure.master = Math.round((mscCommission * 0.6) * 100) / 100;

    if (subRepId) {
      // Sub rep gets 40% of master's commission
      const subTotal = Math.round((structure.master * 0.4) * 100) / 100;
      structure.master = Math.round((structure.master * 0.6) * 100) / 100;
      
      if (subSubRepId) {
        // Sub-sub rep gets 30% of sub's commission
        structure.subSub = Math.round((subTotal * 0.3) * 100) / 100;
        structure.sub = Math.round((subTotal * 0.7) * 100) / 100;
      } else {
        structure.sub = subTotal;
      }
    }

    structure.total = Math.round(
      (structure.master + structure.sub + structure.subSub) * 100
    ) / 100;

    return structure;
  },

  /**
   * Get commission rates for a representative
   */
  async getRepCommissionRates(repId: string) {
    try {
      const { data, error } = await supabase
        .from('commission_agreements')
        .select('*')
        .eq('rep_id', repId)
        .order('effective_date', { ascending: false })
        .limit(1);

      if (error) throw error;

      return data?.[0]?.commission_rate || 0;
    } catch (err) {
      console.error('Error fetching commission rates:', err);
      return 0;
    }
  },

  /**
   * Calculate YTD commissions for a representative
   */
  async calculateYTDCommissions(repId: string) {
    try {
      const currentYear = new Date().getFullYear();
      const startDate = `${currentYear}-01-01`;
      const endDate = `${currentYear}-12-31`;

      const { data, error } = await supabase
        .from('orders')
        .select(`
          order_id,
          invoice_to_doc,
          commission_structure,
          master_rep_id,
          sub_rep_id,
          sub_sub_rep_id
        `)
        .or(`master_rep_id.eq.${repId},sub_rep_id.eq.${repId},sub_sub_rep_id.eq.${repId}`)
        .gte('date_of_service', startDate)
        .lte('date_of_service', endDate);

      if (error) throw error;

      return (data || []).reduce((total, order) => {
        let commission = 0;
        if (order.commission_structure) {
          if (order.master_rep_id === repId) {
            commission = order.commission_structure.master;
          } else if (order.sub_rep_id === repId) {
            commission = order.commission_structure.sub;
          } else if (order.sub_sub_rep_id === repId) {
            commission = order.commission_structure.subSub;
          }
        }
        return total + commission;
      }, 0);
    } catch (err) {
      console.error('Error calculating YTD commissions:', err);
      return 0;
    }
  },

  /**
   * Get pending commission approvals
   */
  async getPendingApprovals() {
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          *,
          doctor:doctor_id(*),
          master_rep:master_rep_id(*),
          sub_rep:sub_rep_id(*),
          sub_sub_rep:sub_sub_rep_id(*)
        `)
        .is('commission_structure', null)
        .eq('status', 'pending');

      if (error) throw error;
      return data || [];
    } catch (err) {
      console.error('Error fetching pending approvals:', err);
      return [];
    }
  },

  /**
   * Approve commission for an order
   */
  async approveCommission(orderId: string, commissionData: CommissionCalculation) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          commission_structure: commissionData,
          status: 'approved',
          approved_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error approving commission:', err);
      throw err;
    }
  },

  /**
   * Reject commission for an order
   */
  async rejectCommission(orderId: string, notes: string) {
    try {
      const { error } = await supabase
        .from('orders')
        .update({
          status: 'rejected',
          commission_structure: { notes },
          rejected_at: new Date().toISOString()
        })
        .eq('order_id', orderId);

      if (error) throw error;
      return true;
    } catch (err) {
      console.error('Error rejecting commission:', err);
      throw err;
    }
  }
};
