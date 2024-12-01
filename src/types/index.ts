import type { User } from '@supabase/supabase-js'

export interface Manufacturer {
  id?: string;
  name: string;
  default_doctor_discount: number;
}

export interface Representative {
  id: number;
  name: string;
}

export interface CommissionRate {
  id: string;
  manufacturer_id: string;
  user_id: string;
  commission_rate: number;
  user?: {
    id: string;
    name: string;
  };
}

export interface CommissionStructure {
  id?: number;
  manufacturer_id: number | null;
  master_rep_id: number | null;
  sub_rep_id: number | null;
  sub_sub_rep_id: number | null;
  master_rep_rate: number;
  sub_rep_rate: number;
  sub_sub_rep_rate: number;
  manufacturer?: Manufacturer;
  master_rep?: Representative;
  sub_rep?: Representative;
  sub_sub_rep?: Representative;
}

export interface AuditLogEntry {
  id: string;
  changed_at: string;
  changed_by: string;
  changed_by_user?: User;
  commission_structure_id: number;
  action: 'insert' | 'update' | 'delete';
  previous_master_rate: number;
  previous_sub_rate: number;
  previous_sub_sub_rate: number;
  new_master_rate: number;
  new_sub_rate: number;
  new_sub_sub_rate: number;
  reason?: string;
} 