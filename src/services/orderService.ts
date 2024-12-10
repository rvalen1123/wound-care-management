import { supabase } from '../lib/supabaseClient';
import type { Order } from '../types/models';
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

export const orderService = {
  async getOrders(options: QueryOptions = {}): Promise<QueryResult<Order>> {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = 'date_of_service',
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
      if (limit > 0) {
        const from = (page - 1) * limit;
        const to = from + limit - 1;
        query = query.range(from, to);
      }

      const { data, error, count } = await query;

      return { data, error, count };
    } catch (error) {
      console.error('Error in getOrders:', error);
      return { data: null, error: error as PostgrestError, count: null };
    }
  },

  async getOrderById(id: string): Promise<Order | null> {
    const { data, error } = await supabase
      .from('orders')
      .select(`
        *,
        doctor:doctor_id(*),
        product:product_id(*),
        master_rep:master_rep_id(*),
        sub_rep:sub_rep_id(*),
        sub_sub_rep:sub_sub_rep_id(*),
        commission_payments(*)
      `)
      .eq('id', id)
      .single();

    if (error) {
      console.error('Error fetching order:', error);
      throw error;
    }

    return data;
  },

  async createOrder(orderData: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .insert([orderData])
      .select(`
        *,
        doctor:doctor_id(*),
        product:product_id(*),
        master_rep:master_rep_id(*),
        sub_rep:sub_rep_id(*),
        sub_sub_rep:sub_sub_rep_id(*)
      `)
      .single();

    if (error) {
      console.error('Error creating order:', error);
      throw error;
    }

    return data;
  },

  async updateOrder(id: string, updates: Partial<Order>): Promise<Order> {
    const { data, error } = await supabase
      .from('orders')
      .update(updates)
      .eq('id', id)
      .select(`
        *,
        doctor:doctor_id(*),
        product:product_id(*),
        master_rep:master_rep_id(*),
        sub_rep:sub_rep_id(*),
        sub_sub_rep:sub_sub_rep_id(*)
      `)
      .single();

    if (error) {
      console.error('Error updating order:', error);
      throw error;
    }

    return data;
  },

  async deleteOrder(id: string): Promise<void> {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  },

  async getOrderAnalytics(timeframe: 'day' | 'week' | 'month' | 'quarter' | 'year' = 'month') {
    try {
      const startDate = getTimeframeDate(timeframe);

      const { data, error } = await supabase
        .from('orders')
        .select(`
          invoice_to_doc,
          msc_commission,
          created_at
        `)
        .gte('created_at', startDate.toISOString());

      if (error) throw error;

      const totalSales = data?.reduce((sum, order) => sum + (order.invoice_to_doc || 0), 0) || 0;
      const totalCommissions = data?.reduce((sum, order) => sum + (order.msc_commission || 0), 0) || 0;

      return {
        data: { totalSales, totalCommissions },
        error: null
      };
    } catch (error) {
      console.error('Error in getOrderAnalytics:', error);
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
