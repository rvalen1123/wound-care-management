import { supabase } from '@/lib/supabaseClient';
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
          *,
          parent:parent_id(id, name, email),
          sub_reps:representatives!parent_id(id, name, email)
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
          doctor:doctor_id(*),
          product:product_id(*),
          master_rep:master_rep_id(*),
          sub_rep:sub_rep_id(*),
          sub_sub_rep:sub_sub_rep_id(*),
          commission_payments(*)
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
        .select(`
          *,
          orders(*)
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
      console.error('Error in getDoctors:', error);
      return { data: null, error: error as PostgrestError, count: null };
    }
  },

  // Products
  async getProducts(options: QueryOptions = {}): Promise<QueryResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'name',
        sortDesc = false,
        filters = {}
      } = options;

      let query = supabase
        .from('products')
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
      console.error('Error in getProducts:', error);
      return { data: null, error: error as PostgrestError, count: null };
    }
  },

  // Commission Payments
  async getCommissionPayments(options: QueryOptions = {}): Promise<QueryResult<any>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'payment_date',
        sortDesc = true,
        filters = {}
      } = options;

      let query = supabase
        .from('commission_payments')
        .select(`
          *,
          order:order_id(*),
          representative:rep_id(*)
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
      console.error('Error in getCommissionPayments:', error);
      return { data: null, error: error as PostgrestError, count: null };
    }
  },

  // Analytics
  async getAnalytics(timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month') {
    try {
      const startDate = getTimeframeDate(timeframe);

      // Get total sales and commissions
      const { data: orderStats, error: orderError } = await supabase
        .from('orders')
        .select(`
          invoice_to_doc,
          msc_commission,
          created_at
        `)
        .gte('created_at', startDate.toISOString());

      // Get top performing reps
      const { data: topReps, error: repsError } = await supabase
        .from('representatives')
        .select(`
          name,
          orders:orders!master_rep_id(count)
        `)
        .order('orders(count)', { ascending: false })
        .limit(5);

      if (orderError || repsError) {
        throw new Error('Error fetching analytics data');
      }

      const totalSales = orderStats?.reduce((sum, order) => sum + (order.invoice_to_doc || 0), 0) || 0;
      const totalCommissions = orderStats?.reduce((sum, order) => sum + (order.msc_commission || 0), 0) || 0;

      return {
        data: {
          totalSales,
          totalCommissions,
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
