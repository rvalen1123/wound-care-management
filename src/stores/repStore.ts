import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import type { Representative, CommissionAgreement } from '@/types/rep';

export const useRepStore = defineStore('reps', () => {
  const reps = ref<Representative[]>([]);
  const commissionAgreements = ref<CommissionAgreement[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const ytdCommission = ref(0);
  const lastYearCommission = ref(0);
  const monthlyOrders = ref<number[]>([]);
  const monthlyCommission = ref<number[]>([]);
  const recentOrders = ref<any[]>([]);

  // Getters
  const getRepById = computed(() => {
    return (id: string) => reps.value.find((rep: Representative) => rep.id === id);
  });

  const getRepsByRole = computed(() => {
    return (role: string) => reps.value.filter((rep: Representative) => rep.role === role);
  });

  const getSubReps = computed(() => {
    return (parentId: string) => reps.value.filter((rep: Representative) => 
      rep.role === 'sub' && rep.parent_id === parentId
    );
  });

  const getSubSubReps = computed(() => {
    return (parentId: string) => reps.value.filter((rep: Representative) => 
      rep.role === 'sub-sub' && rep.parent_id === parentId
    );
  });

  const getYTDCommission = computed(() => {
    return () => ytdCommission.value;
  });

  // Actions
  async function fetchReps() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('representatives')
        .select('*')
        .order('name');

      if (err) throw err;

      reps.value = data || [];
    } catch (err) {
      console.error('Error fetching reps:', err);
      error.value = 'Failed to fetch representatives';
    } finally {
      loading.value = false;
    }
  }

  async function createRep(rep: Partial<Representative>) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('representatives')
        .insert([rep])
        .select()
        .single();

      if (err) throw err;

      if (data) {
        reps.value.push(data as Representative);
      }

      return data as Representative;
    } catch (err) {
      console.error('Error creating rep:', err);
      error.value = 'Failed to create representative';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function updateRep(id: string, updates: Partial<Representative>) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('representatives')
        .update(updates)
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;

      if (data) {
        const index = reps.value.findIndex((rep: Representative) => rep.id === id);
        if (index !== -1) {
          reps.value[index] = { ...reps.value[index], ...data } as Representative;
        }
      }

      return data as Representative;
    } catch (err) {
      console.error('Error updating rep:', err);
      error.value = 'Failed to update representative';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function deleteRep(id: string) {
    loading.value = true;
    error.value = null;

    try {
      const { error: err } = await supabase
        .from('representatives')
        .delete()
        .eq('id', id);

      if (err) throw err;

      reps.value = reps.value.filter((rep: Representative) => rep.id !== id);
    } catch (err) {
      console.error('Error deleting rep:', err);
      error.value = 'Failed to delete representative';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchCommissionAgreements() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('commission_agreements')
        .select('*')
        .order('effective_date', { ascending: false });

      if (err) throw err;

      commissionAgreements.value = data || [];
    } catch (err) {
      console.error('Error fetching commission agreements:', err);
      error.value = 'Failed to fetch commission agreements';
    } finally {
      loading.value = false;
    }
  }

  async function updateCommissionAgreement(repId: string, rate: number) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('commission_agreements')
        .insert([{
          rep_id: repId,
          commission_rate: rate,
          effective_date: new Date().toISOString()
        }])
        .select()
        .single();

      if (err) throw err;

      if (data) {
        commissionAgreements.value.unshift(data as CommissionAgreement);
      }
    } catch (err) {
      console.error('Error updating commission agreement:', err);
      error.value = 'Failed to update commission agreement';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function calculateCommission(orderId: string) {
    // Implementation depends on your commission calculation logic
    return 0;
  }

  async function generateCommissionReport(startDate: string, endDate: string) {
    // Implementation depends on your report generation logic
    return {};
  }

  return {
    reps,
    commissionAgreements,
    loading,
    error,
    ytdCommission,
    lastYearCommission,
    monthlyOrders,
    monthlyCommission,
    recentOrders,
    getRepById,
    getRepsByRole,
    getSubReps,
    getSubSubReps,
    getYTDCommission,
    fetchReps,
    createRep,
    updateRep,
    deleteRep,
    fetchCommissionAgreements,
    updateCommissionAgreement,
    calculateCommission,
    generateCommissionReport
  };
});
