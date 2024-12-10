import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import type { Representative, CommissionAgreement } from '@/types/models';

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
    return (parentId: string) => reps.value.filter(
      (rep: Representative) => rep.role === 'sub' && rep.parent_id === parentId
    );
  });

  const getSubSubReps = computed(() => {
    return (parentId: string) => reps.value.filter(
      (rep: Representative) => rep.role === 'sub-sub' && rep.parent_id === parentId
    );
  });

  // Actions
  async function fetchReps() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('representatives')
        .select(`
          *,
          parent:parent_id(id, name),
          commission_agreements(*)
        `)
        .order('name');

      if (err) throw err;

      reps.value = data || [];
    } catch (err) {
      console.error('Error fetching reps:', err);
      error.value = 'Failed to fetch representatives';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function createRep(repData: Partial<Representative>) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('representatives')
        .insert([{
          ...repData,
          created_at: new Date().toISOString()
        }])
        .select()
        .single();

      if (err) throw err;

      if (data) {
        reps.value.push(data);
      }

      return data;
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
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', id)
        .select()
        .single();

      if (err) throw err;

      if (data) {
        const index = reps.value.findIndex(rep => rep.id === id);
        if (index !== -1) {
          reps.value[index] = { ...reps.value[index], ...data };
        }
      }

      return data;
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

      reps.value = reps.value.filter(rep => rep.id !== id);
    } catch (err) {
      console.error('Error deleting rep:', err);
      error.value = 'Failed to delete representative';
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function fetchRepCommissions() {
    loading.value = true;
    error.value = null;

    try {
      const { data: commissionData, error: err } = await supabase
        .from('commissions')
        .select('*')
        .order('created_at', { ascending: false });

      if (err) throw err;

      ytdCommission.value = calculateYTDCommission(commissionData);
      monthlyCommission.value = calculateMonthlyCommission(commissionData);
    } catch (err) {
      console.error('Error fetching commissions:', err);
      error.value = 'Failed to fetch commission data';
    } finally {
      loading.value = false;
    }
  }

  // Helper functions
  function calculateYTDCommission(commissionData: any[]): number {
    const currentYear = new Date().getFullYear();
    return commissionData
      .filter(c => new Date(c.created_at).getFullYear() === currentYear)
      .reduce((sum, c) => sum + (c.amount || 0), 0);
  }

  function calculateMonthlyCommission(commissionData: any[]): number[] {
    const months = Array(12).fill(0);
    const currentYear = new Date().getFullYear();

    commissionData.forEach(commission => {
      const date = new Date(commission.created_at);
      if (date.getFullYear() === currentYear) {
        months[date.getMonth()] += commission.amount || 0;
      }
    });

    return months;
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
    fetchReps,
    createRep,
    updateRep,
    deleteRep,
    fetchRepCommissions
  };
});
