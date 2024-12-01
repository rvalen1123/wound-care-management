import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabaseClient';
import type { Representative, CommissionAgreement } from '@/types/rep';

interface RepProfile {
  id: string;
  name: string;
  default_commission_rate: number;
}

interface RecentOrder {
  id: string;
  date_of_service: string;
  doctor: {
    name: string;
  };
  product: {
    name: string;
  };
  commission_amount: number;
  status: string;
}

export const useRepStore = defineStore('reps', () => {
  const reps = ref<Representative[]>([]);
  const commissionAgreements = ref<CommissionAgreement[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const ytdCommission = ref(0);
  const lastYearCommission = ref(0);
  const monthlyOrders = ref<number[]>([]);
  const monthlyCommission = ref<number[]>([]);
  const recentOrders = ref<RecentOrder[]>([]);

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

  async function fetchRecentOrders() {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select(`
          id,
          date_of_service,
          doctor:doctor_id(name),
          product:product_id(name),
          commission_amount,
          status
        `)
        .order('date_of_service', { ascending: false })
        .limit(10);

      if (err) throw err;

      recentOrders.value = data || [];
    } catch (err) {
      console.error('Error fetching recent orders:', err);
      error.value = 'Failed to fetch recent orders';
    } finally {
      loading.value = false;
    }
  }

  function getRecentOrders() {
    return recentOrders.value;
  }

  function getCurrentMonthOrders() {
    return monthlyOrders.value[monthlyOrders.value.length - 1] || 0;
  }

  function getCurrentMonthCommission() {
    return monthlyCommission.value[monthlyCommission.value.length - 1] || 0;
  }

  function getCurrentRepProfile(): RepProfile | null {
    // Implementation depends on your authentication setup
    return {
      id: '1',
      name: 'Test Rep',
      default_commission_rate: 15
    };
  }

  async function generateCommissionReport(startDate: string, endDate: string) {
    loading.value = true;
    error.value = null;

    try {
      const { data, error: err } = await supabase
        .from('orders')
        .select(`
          date_of_service,
          doctor:doctor_id(name),
          product:product_id(name),
          commission_amount
        `)
        .gte('date_of_service', startDate)
        .lte('date_of_service', endDate)
        .order('date_of_service', { ascending: false });

      if (err) throw err;

      return data || [];
    } catch (err) {
      console.error('Error generating commission report:', err);
      error.value = 'Failed to generate commission report';
      return [];
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
    // Implementation for monthly commission calculation
    return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
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
    getRecentOrders,
    getCurrentMonthOrders,
    getCurrentMonthCommission,
    getCurrentRepProfile,
    fetchReps,
    fetchRepCommissions,
    fetchRecentOrders,
    generateCommissionReport
  };
});
