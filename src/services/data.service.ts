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
  // Representatives
  async getReps(options: QueryOptions = {}): Promise<QueryResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortDesc = true,
        filters = {}
      } = options;

      let query = supabase
        .from('representatives')
        .select(`
          rep_id,
          rep_name,
          commission_formula,
          rep_type,
          created_at,
          updated_at
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
      console.error('Error in getReps:', error);
      return { data: null, error: error as PostgrestError, count: null };
    }
  },

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
          doctors(name),
          products(Product, "National ASP", Manufacturer),
          representatives!orders_rep_id_fkey(
            rep_id,
            rep_name,
            commission_formula,
            rep_type
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

  // Doctors
  async getDoctors(options: QueryOptions = {}): Promise<QueryResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortDesc = false,
        filters = {}
      } = options;

      let query = supabase
        .from('doctors')
        .select('*', { count: 'exact' });

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
      console.error('Error in getDoctors:', error);
      return { data: null, error: error as PostgrestError, count: null };
    }
  },

  // Commission Structures
  async getCommissionStructures(options: QueryOptions = {}): Promise<QueryResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'created_at',
        sortDesc = true,
        filters = {}
      } = options;

      let query = supabase
        .from('commission_structures')
        .select(`
          *,
          orders(id, date_of_service),
          representatives(rep_id, rep_name, commission_formula, rep_type)
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
      console.error('Error in getCommissionStructures:', error);
      return { data: null, error: error as PostgrestError, count: null };
    }
  },

  // Analytics
  async getAnalytics(timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month') {
    try {
      // Get total sales
      const { data: salesData, error: salesError } = await supabase
        .from('orders')
        .select('invoice_to_doc, created_at')
        .gte('created_at', getTimeframeDate(timeframe));

      // Get total commissions
      const { data: commissionsData, error: commissionsError } = await supabase
        .from('orders')
        .select('msc_commission, created_at')
        .gte('created_at', getTimeframeDate(timeframe));

      // Get top performing reps
      const { data: topReps, error: repsError } = await supabase
        .from('representatives')
        .select(`
          rep_name,
          orders!orders_rep_id_fkey(count)
        `)
        .order('orders(count)', { ascending: false })
        .limit(5);

      if (salesError || commissionsError || repsError) {
        throw new Error('Error fetching analytics data');
      }

      return {
        data: {
          totalSales: salesData?.reduce((sum, order) => sum + (order.invoice_to_doc || 0), 0) || 0,
          totalCommissions: commissionsData?.reduce((sum, comm) => sum + (comm.msc_commission || 0), 0) || 0,
          topReps: topReps || []
        },
        error: null
      };
    } catch (error) {
      console.error('Error in getAnalytics:', error);
      return { data: null, error: error as PostgrestError };
    }
  }
};

// Helper function to get date for timeframe
function getTimeframeDate(timeframe: string): Date {
  const now = new Date();
  switch (timeframe) {
    case 'day':
      return new Date(now.setDate(now.getDate() - 1));
    case 'week':
      return new Date(now.setDate(now.getDate() - 7));
    case 'month':
      return new Date(now.setMonth(now.getMonth() - 1));
    case 'quarter':
      return new Date(now.setMonth(now.getMonth() - 3));
    case 'year':
      return new Date(now.setFullYear(now.getFullYear() - 1));
    default:
      return new Date(now.setMonth(now.getMonth() - 1));
  }
}
