export interface CommissionAuditLog {
  id: string;
  changed_at: string;
  changed_by: string;
  previous_master_rate: number;
  previous_sub_rate?: number;
  previous_sub_sub_rate?: number;
  new_master_rate: number;
  new_sub_rate?: number;
  new_sub_sub_rate?: number;
  reason?: string;
}

export interface CommissionStructure {
  id: string;
  master_rep_id: string;
  sub_rep_id?: string;
  sub_sub_rep_id?: string;
  master_rep_rate: number;
  sub_rep_rate?: number;
  sub_sub_rep_rate?: number;
  master_rep?: { name: string };
  sub_rep?: { name: string };
  sub_sub_rep?: { name: string };
  created_at?: string;
  updated_at?: string;
}

export type OrderStatus = 'pending' | 'approved' | 'rejected';

export interface Order {
  id: string;
  status: OrderStatus;
  approved_by?: string;
  approved_at?: string;
  base_price: number;
  doctor?: {
    id: string;
    name: string;
  };
  product?: {
    id: string;
    name: string;
    manufacturer: string;
    national_asp: number;
    sizes: string[];
    default_commission_rate: number;
  };
}
