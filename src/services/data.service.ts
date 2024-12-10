import { supabase } from '../lib/supabaseClient';
import type { PostgrestError } from '@supabase/supabase-js';

export interface QueryOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortDesc?: boolean;
  filters?: Record<string, any>;
}

export interface QueryResult<T> {
  data: T[] | null;
  count: number | null;
  error: PostgrestError | null;
}

export const dataService = {
  // Orders
  async getOrders(options: QueryOptions = {}): Promise<QueryResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortDesc = true,
        filters = {}
      } = options;

      let query = supabase
        .from('orders')
        .select(`
          *,
          doctor:doctor_id(
            doctor_id,
            name,
            business_name,
            email
          )
        `, { count: 'exact' });

      // Apply filters
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });

      // Apply sorting
      query = query.order(sortBy, { ascending: !sortDesc });

      // Apply pagination
      const from = (page - 1) * limit;
      const to = from + limit - 1;
      query = query.range(from, to);

      const { data, error, count } = await query;

      return { data, error, count };
    } catch (error) {
      console.error('Error in getOrders:', error);
      return { data: null, error: error as PostgrestError, count: null };
    }
  },

  // Analytics
  async getAnalytics(period: 'day' | 'week' | 'month' | 'year' = 'month'): Promise<{ data: any; error: PostgrestError | null }> {
    try {
      // Get the date range based on period
      const now = new Date();
      let startDate = new Date();
      switch (period) {
        case 'day':
          startDate.setDate(now.getDate() - 1);
          break;
        case 'week':
          startDate.setDate(now.getDate() - 7);
          break;
        case 'month':
          startDate.setMonth(now.getMonth() - 1);
          break;
        case 'year':
          startDate.setFullYear(now.getFullYear() - 1);
          break;
      }

      // Get orders for the period
      const { data: orders, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          rep:rep_id(
            id,
            name,
            email
          )
        `)
        .gte('created_at', startDate.toISOString())
        .lte('created_at', now.toISOString());

      if (ordersError) throw ordersError;

      // Calculate total sales and commissions
      const totalSales = orders?.reduce((sum, order) => sum + (order.invoice_to_doc || 0), 0) || 0;
      const totalCommissions = orders?.reduce((sum, order) => sum + (order.msc_commission || 0), 0) || 0;

      // Get top performing reps
      const repSales = orders?.reduce((acc: Record<string, number>, order) => {
        const repId = order.rep_id;
        if (repId) {
          acc[repId] = (acc[repId] || 0) + (order.invoice_to_doc || 0);
        }
        return acc;
      }, {});

      const topReps = Object.entries(repSales || {})
        .map(([repId, sales]) => ({
          id: repId,
          name: orders?.find(o => o.rep_id === repId)?.rep?.name || 'Unknown',
          totalSales: sales
        }))
        .sort((a, b) => b.totalSales - a.totalSales)
        .slice(0, 5);

      return {
        data: {
          totalSales,
          totalCommissions,
          topReps
        },
        error: null
      };
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      return { data: null, error: error as PostgrestError };
    }
  },

  // Representatives
  async getReps(options: QueryOptions = {}): Promise<QueryResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortDesc = true,
        filters = {}
      } = options;

      // First get all reps
      const { data: allReps, error: repsError } = await supabase
        .from('reps')
        .select('*');

      if (repsError) throw repsError;

      // Then for each rep, get their parent and sub reps
      const enrichedData = await Promise.all((allReps || []).map(async (rep) => {
        // Get parent if exists
        let parent = null;
        if (rep.parent_id) {
          const { data: parentData } = await supabase
            .from('reps')
            .select('id, name, email, role')
            .eq('id', rep.parent_id)
            .single();
          parent = parentData;
        }

        // Get sub reps
        const { data: subReps } = await supabase
          .from('reps')
          .select('id, name, email, role')
          .eq('parent_id', rep.id);

        // Get rep's orders
        const { data: orders } = await supabase
          .from('orders')
          .select('*')
          .eq('rep_id', rep.id);

        // Calculate total sales and commission
        const totalSales = orders?.reduce((sum, order) => sum + (order.invoice_to_doc || 0), 0) || 0;
        const totalCommission = orders?.reduce((sum, order) => sum + (order.msc_commission || 0), 0) || 0;

        // Get count of accounts (doctors)
        const { count: accountCount } = await supabase
          .from('orders')
          .select('doctor_id', { count: 'exact', head: true })
          .eq('rep_id', rep.id);

        return {
          ...rep,
          parent,
          sub_reps: subReps || [],
          totalSales,
          totalCommission,
          accountCount: accountCount || 0,
          subRepCount: (subReps || []).length
        };
      }));

      // Sort and paginate the enriched data
      const sortedData = enrichedData
        .sort((a, b) => sortDesc ? (b.totalSales - a.totalSales) : (a.totalSales - b.totalSales))
        .slice((page - 1) * limit, page * limit);

      return { 
        data: sortedData, 
        error: null, 
        count: allReps?.length || 0 
      };
    } catch (error) {
      console.error('Error in getReps:', error);
      return { data: null, error: error as PostgrestError, count: null };
    }
  }
};
