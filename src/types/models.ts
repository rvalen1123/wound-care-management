// Base Types
export interface BaseModel {
  created_at: string;
  updated_at: string;
}

// Rep Types
export interface Rep extends BaseModel {
  rep_id: string;
  name: string;
  email: string;
  status: 'active' | 'inactive';
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
  parent_rep?: Rep;
  child_rep?: Rep;
}

// Commission Types
export interface CommissionStructure extends BaseModel {
  id: string;
  order_id: string;
  rep_id: string;
  base_commission_amount: number;
  final_commission_amount: number | null;
  status: 'pending' | 'approved' | 'rejected';
  approved_at?: string;
  approved_by?: string;
  // Populated fields
  rep?: Rep;
  order?: Order;
  splits?: CommissionSplit[];
}

export interface CommissionSplit {
  id: string;
  commission_structure_id: string;
  rep_id: string;
  split_percentage: number;
  split_amount: number;
  relationship_id?: string;
  created_at: string;
  // Populated fields
  rep?: Rep;
  relationship?: RepRelationship;
}

export interface PendingCommissionReview extends BaseModel {
  id: string;
  commission_structure_id: string;
  proposed_by: string;
  reviewed_by?: string;
  status: 'pending' | 'approved' | 'rejected';
  notes?: string;
  // Populated fields
  commission_structure?: CommissionStructure;
  proposer?: Rep;
  reviewer?: User;
}

// Order Types
export interface Order extends BaseModel {
  order_id: string;
  doctor_id: string;
  rep_id: string;
  'Q Code': string;
  date_of_service: string;
  credit_terms?: string;
  graph_size: string;
  units: number;
  invoice_amount_billed: number;
  invoice_to_doc: number;
  expected_collection_date: string;
  manufacturer_paid_date?: string;
  amount_paid_to_manufacturer?: number;
  running_balance_owed?: number;
  manufacturer_payment_status?: string;
  msc_commission_str?: string;
  msc_paid_date?: string;
  msc_commission: number;
  payment_status: string;
  // Populated fields
  doctor?: Doctor;
  rep?: Rep;
  product?: Product;
  commission_structure?: CommissionStructure;
}

// Doctor Types
export interface Doctor extends BaseModel {
  doctor_id: string;
  name: string;
  email?: string;
  business_name?: string;
  address?: string;
  phone?: string;
  default_credit_terms: string;
}

// Product Types
export interface Product extends BaseModel {
  Product: string;
  'Q Code': string;
  'National ASP': number;
  'Your Price': number;
  MUE: number;
  Manufacturer: string;
}

// Payment Types
export interface Payment extends BaseModel {
  payment_id: string;
  order_id: string;
  amount_paid: number;
  payment_date: string;
  remaining_balance: number;
  // Populated fields
  order?: Order;
}

// User Types
export interface User {
  id: string;
  email: string;
  user_metadata?: {
    role: 'admin' | 'rep' | 'doctor';
    name: string;
  };
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
  rep: Rep;
  commission_split: number;
  children: RepHierarchyNode[];
}
