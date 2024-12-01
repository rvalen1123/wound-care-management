export interface SalesRepStats {
  id: string;
  rep_id: string;
  month: string;
  total_orders: number;
  total_sales: number;
  total_commission: number;
  created_at: string;
  updated_at?: string;
}

export default SalesRepStats;
