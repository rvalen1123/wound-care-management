export interface User {
  id: string;
  email: string;
  role: 'admin' | 'rep' | 'doctor';
  name: string;
  status: 'active' | 'inactive';
}

export interface Representative {
  id: string;
  name: string;
  email: string;
  role: 'master' | 'sub' | 'sub-sub';
  parent_id?: string;
  parent?: Representative;
  commission_rate: number;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
  commission_agreements?: CommissionAgreement[];
}

export interface Product {
  id: string;
  name: string;
  'National ASP': number;
  sizes: string[];
  commission_rate: number;
  manufacturer_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

export interface Order {
  order_id: string;
  doctor_id: string;
  product_id: string;
  date_of_service: string;
  size: string;
  units: number;
  invoice_to_doc: number;
  msc_commission: number;
  expected_collection_date: string;
  payment_status: 'pending' | 'paid' | 'cancelled';
  master_rep_id: string;
  sub_rep_id?: string;
  sub_sub_rep_id?: string;
  commission_structure: {
    master: number;
    sub: number;
    subSub: number;
  };
  created_by: string;
  created_at: string;
  updated_by?: string;
  updated_at?: string;
}

export interface CommissionAgreement {
  id: string;
  rep_id: string;
  commission_rate: number;
  effective_date: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface Doctor {
  id: string;
  name: string;
  email: string;
  specialty: string;
  primary_rep_id: string;
  status: 'active' | 'inactive';
  created_at: string;
  updated_at?: string;
}

export interface CommissionStructure {
  id: string;
  product_id: string;
  rep_type: 'master' | 'sub' | 'sub-sub';
  commission_rate: number;
  effective_date: string;
  end_date?: string;
  created_at: string;
  updated_at?: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: 'insert' | 'update' | 'delete';
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  user_id: string;
  created_at: string;
}

export interface CommissionCalculation {
  master: number;
  sub: number;
  subSub: number;
  total: number;
}
