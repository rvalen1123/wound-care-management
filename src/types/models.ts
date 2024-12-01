export interface Doctor {
  id: string;
  name: string;
  default_credit_terms: string;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  national_asp: number;
  size: string;
  sizes?: string[];
  default_commission_rate: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface Representative {
  id: string;
  name: string;
  role: 'master' | 'sub' | 'sub-sub';
  parent_rep_id?: string | null;
  default_commission_rate: number;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
}

export interface CommissionStructure {
  id?: string;
  order_id: string;
  master_rep_id: string;
  sub_rep_id?: string | null;
  sub_sub_rep_id?: string | null;
  master_rep_rate: number;
  sub_rep_rate?: number;
  sub_sub_rep_rate?: number;
  master_rep_amount: number;
  sub_rep_amount?: number;
  sub_sub_rep_amount?: number;
  total_commission: number;
  created_at?: string;
  created_by?: string;
  updated_at?: string;
  updated_by?: string;
}

export interface Order {
  id?: string;
  doctor_id: string | null;
  product_id: string | null;
  date_of_service: string | null;
  size: string;
  units: number;
  invoice_to_doc: number;
  expected_collection_date: string | null;
  status: 'pending' | 'approved' | 'paid' | 'partial' | 'outstanding';
  msc_commission: number;
  master_rep_id: string | null;
  sub_rep_id?: string | null;
  sub_sub_rep_id?: string | null;
  commission_structure?: CommissionStructure | null;
  created_at?: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  // Relations
  doctor?: Doctor;
  product?: Product;
  master_rep?: Representative;
  sub_rep?: Representative;
  sub_sub_rep?: Representative;
}

export interface PaymentBatch {
  id: string;
  order_id: string;
  amount: number;
  status: 'pending' | 'processed' | 'failed';
  type: 'manufacturer' | 'commission';
  recipient_type: 'manufacturer' | 'master_rep' | 'sub_rep' | 'sub_sub_rep';
  recipient_id: string;
  created_at?: string;
  created_by?: string;
  processed_at?: string;
  processed_by?: string;
}

export interface AuditLog {
  id: string;
  table_name: string;
  record_id: string;
  action: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  changed_by: string;
  changed_at: string;
}

export interface ValidationError {
  $message: string;
  $params: Record<string, any>;
  $pending: boolean;
  $property: string;
}

export interface ValidationResult {
  $model: any;
  $dirty: boolean;
  $error: boolean;
  $invalid: boolean;
  $pending: boolean;
  $params: Record<string, any>;
  $touch(): void;
  $reset(): void;
  $errors: ValidationError[];
}

export interface OrderCalculations {
  invoiceAmount: number;
  mscCommission: number;
  expectedCollectionDate: string;
}

export interface CommissionCalculation {
  mscCommission: number;
  masterRepId: string | null;
  subRepId?: string | null;
  subSubRepId?: string | null;
}
