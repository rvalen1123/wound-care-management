import type { User as SupabaseUser } from '@supabase/supabase-js';

// Base Types
export interface BaseModel {
  created_at?: string;
  updated_at?: string;
}

// Auth Types
export interface UserMetadata {
  role: 'admin' | 'rep' | 'doctor';
  name: string;
  rep_type?: 'master' | 'sub' | 'sub-sub';
  doctor_id?: string;
}

export interface User extends Omit<SupabaseUser, 'user_metadata'> {
  user_metadata: UserMetadata;
}

export type AuthUser = User | null;

// Rep Types
export interface Representative extends BaseModel {
  id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
  role: 'master' | 'sub' | 'sub-sub';
  parent_id?: string | null;
  // Calculated fields
  totalSales?: number;
  totalCommission?: number;
  accountCount?: number;
  subRepCount?: number;
}

export interface RepRelationship extends BaseModel {
  id: string;
  parent_rep_id: string;
  child_rep_id: string;
  commission_split: number;
  start_date: string;
  end_date?: string;
  status: 'pending' | 'active' | 'inactive';
  // Populated fields
  parent_rep?: Representative;
  child_rep?: Representative;
}

// Order Types
export type OrderStatus = 'pending' | 'approved' | 'rejected' | 'paid' | 'partial' | 'outstanding';

export interface Order extends BaseModel {
  order_id: string;
  doctor_id: string;
  q_code: string;
  date_of_service: string;
  credit_terms: string;
  graph_size: string;
  units: number;
  invoice_amount_billed: number;
  invoice_to_doc: number;
  expected_collection_date: string;
  manufacturer_paid_date: string;
  amount_paid_to_manufacturer: number;
  running_balance_owed: number;
  manufacturer_payment_status: string | null;
  msc_commission_str: string;
  msc_paid_date: string;
  msc_commission: number | null;
  payment_status: string;
  status: OrderStatus;
  master_rep_id?: string;
  sub_rep_id?: string;
  sub_sub_rep_id?: string;
  commission_structure?: any;
  // Populated fields
  doctor?: Doctor;
  master_rep?: Representative;
  sub_rep?: Representative;
  sub_sub_rep?: Representative;
}

export interface Doctor extends BaseModel {
  id: string;
  name: string;
  business_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  default_credit_terms?: string;
}

export interface Analytics {
  totalSales: number;
  totalCommissions: number;
  topReps: Array<{
    id: string;
    name: string;
    totalSales: number;
  }>;
}

export interface DashboardMetrics {
  owedByDoctors: number;
  owedToManufacturers: number;
  owedInCommissions: number;
  totalDoctors: number;
  totalProducts: number;
  totalReps: number;
}

// Commission Types
export interface CommissionAuditLog extends BaseModel {
  id: string;
  structure_id: string;
  changed_by: string;
  changed_at: string;
  previous_master_rate: number;
  previous_sub_rate?: number;
  previous_sub_sub_rate?: number;
  new_master_rate: number;
  new_sub_rate?: number;
  new_sub_sub_rate?: number;
  reason?: string;
  // Populated fields
  changed_by_user?: User;
}

// Commission Calculation Types
export interface CommissionCalculation {
  base_amount: number;
  splits: {
    rep_id: string;
    percentage: number;
    amount: number;
  }[];
  total_splits: number;
  final_amount: number;
}

// Dashboard Types
export interface CommissionSummary {
  direct_commission: number;
  indirect_commission: number;
  pending_commission: number;
  total_commission: number;
  commission_by_period: {
    period: string;
    amount: number;
  }[];
}

export interface RepHierarchyNode {
  rep: Representative;
  commission_split: number;
  children: RepHierarchyNode[];
}
