import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import type { 
  CommissionStructure, 
  CommissionSplit, 
  PendingCommissionReview,
  CommissionSummary,
  CommissionCalculation,
  Rep
} from '../types/models';

export const useCommissionStore = defineStore('commission', () => {
  // State
  const structures = ref<CommissionStructure[]>([]);
  const pendingReviews = ref<PendingCommissionReview[]>([]);
  const commissionSummary = ref<CommissionSummary | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Getters
  const getPendingCommissions = computed(() => 
    structures.value.filter((s: CommissionStructure) => s.status === 'pending')
  );

  const getCommissionsByOrder = computed(() => 
    (orderId: string) => structures.value.find((s: CommissionStructure) => s.order_id === orderId)
  );

  const getTotalCommission = computed(() => 
    commissionSummary.value?.total_commission || 0
  );

  const getDirectCommission = computed(() => 
    commissionSummary.value?.direct_commission || 0
  );

  const getIndirectCommission = computed(() => 
    commissionSummary.value?.indirect_commission || 0
  );

  // Actions
  async function fetchCommissionStructures(repId?: string) {
    loading.value = true;
    try {
      let query = supabase
        .from('commission_structures')
        .select(`
          *,
          rep:rep_id(*),
          order:order_id(*),
          splits:commission_splits(
            *,
            rep:rep_id(*),
            relationship:relationship_id(*)
          )
        `);

      if (repId) {
        query = query.eq('rep_id', repId);
      }

      const { data, error: queryError } = await query;
      if (queryError) throw queryError;
      structures.value = data;
    } catch (err) {
      console.error('Error fetching commission structures:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch commission structures';
    } finally {
      loading.value = false;
    }
  }

  async function fetchPendingReviews() {
    loading.value = true;
    try {
      const { data, error: queryError } = await supabase
        .from('pending_commission_reviews')
        .select(`
          *,
          commission_structure:commission_structure_id(
            *,
            rep:rep_id(*),
            order:order_id(*)
          ),
          proposer:proposed_by(*),
          reviewer:reviewed_by(*)
        `)
        .eq('status', 'pending');

      if (queryError) throw queryError;
      pendingReviews.value = data;
    } catch (err) {
      console.error('Error fetching pending reviews:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch pending reviews';
    } finally {
      loading.value = false;
    }
  }

  async function createCommissionStructure(orderId: string, repId: string, baseAmount: number) {
    try {
      const { data: structure, error: structureError } = await supabase
        .from('commission_structures')
        .insert({
          order_id: orderId,
          rep_id: repId,
          base_commission_amount: baseAmount
        })
        .select()
        .single();

      if (structureError) throw structureError;

      const { data: review, error: reviewError } = await supabase
        .from('pending_commission_reviews')
        .insert({
          commission_structure_id: structure.id,
          proposed_by: repId
        })
        .select()
        .single();

      if (reviewError) throw reviewError;

      await fetchCommissionStructures(repId);
      return structure;
    } catch (err) {
      console.error('Error creating commission structure:', err);
      error.value = err instanceof Error ? err.message : 'Failed to create commission structure';
      return null;
    }
  }

  async function approveCommissionStructure(structureId: string, reviewId: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error: structureError } = await supabase
        .from('commission_structures')
        .update({
          status: 'approved',
          approved_at: new Date().toISOString(),
          approved_by: user.id
        })
        .eq('id', structureId);

      if (structureError) throw structureError;

      const { error: reviewError } = await supabase
        .from('pending_commission_reviews')
        .update({
          status: 'approved',
          reviewed_by: user.id
        })
        .eq('id', reviewId);

      if (reviewError) throw reviewError;

      await Promise.all([
        fetchCommissionStructures(),
        fetchPendingReviews()
      ]);
    } catch (err) {
      console.error('Error approving commission structure:', err);
      error.value = err instanceof Error ? err.message : 'Failed to approve commission structure';
    }
  }

  async function rejectCommissionStructure(structureId: string, reviewId: string, notes: string) {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      const { error: structureError } = await supabase
        .from('commission_structures')
        .update({
          status: 'rejected'
        })
        .eq('id', structureId);

      if (structureError) throw structureError;

      const { error: reviewError } = await supabase
        .from('pending_commission_reviews')
        .update({
          status: 'rejected',
          reviewed_by: user.id,
          notes
        })
        .eq('id', reviewId);

      if (reviewError) throw reviewError;

      await Promise.all([
        fetchCommissionStructures(),
        fetchPendingReviews()
      ]);
    } catch (err) {
      console.error('Error rejecting commission structure:', err);
      error.value = err instanceof Error ? err.message : 'Failed to reject commission structure';
    }
  }

  async function fetchCommissionSummary(repId: string) {
    loading.value = true;
    try {
      const { data: directData, error: directError } = await supabase
        .from('commission_splits')
        .select('split_amount')
        .eq('rep_id', repId)
        .eq('commission_structure.status', 'approved');

      if (directError) throw directError;

      const { data: indirectData, error: indirectError } = await supabase
        .from('commission_splits')
        .select('split_amount')
        .eq('relationship.parent_rep_id', repId)
        .eq('commission_structure.status', 'approved');

      if (indirectError) throw indirectError;

      const { data: pendingData, error: pendingError } = await supabase
        .from('commission_structures')
        .select('base_commission_amount')
        .eq('rep_id', repId)
        .eq('status', 'pending');

      if (pendingError) throw pendingError;

      const direct_commission = directData.reduce((sum, split) => sum + split.split_amount, 0);
      const indirect_commission = indirectData.reduce((sum, split) => sum + split.split_amount, 0);
      const pending_commission = pendingData.reduce((sum, structure) => sum + structure.base_commission_amount, 0);

      commissionSummary.value = {
        direct_commission,
        indirect_commission,
        pending_commission,
        total_commission: direct_commission + indirect_commission,
        commission_by_period: []
      };
    } catch (err) {
      console.error('Error fetching commission summary:', err);
      error.value = err instanceof Error ? err.message : 'Failed to fetch commission summary';
    } finally {
      loading.value = false;
    }
  }

  function clearError() {
    error.value = null;
  }

  return {
    // State
    structures,
    pendingReviews,
    commissionSummary,
    loading,
    error,
    // Getters
    getPendingCommissions,
    getCommissionsByOrder,
    getTotalCommission,
    getDirectCommission,
    getIndirectCommission,
    // Actions
    fetchCommissionStructures,
    fetchPendingReviews,
    createCommissionStructure,
    approveCommissionStructure,
    rejectCommissionStructure,
    fetchCommissionSummary,
    clearError
  };
});
