import type { User } from '@supabase/supabase-js'

export interface Doctor {
  id: string
  name: string
  default_credit_terms: string
  created_at?: string
  updated_at?: string
}

export interface Product {
  id: string
  name: string
  manufacturer: string
  national_asp: number
  sizes: string[]
  default_commission_rate: number
  created_at?: string
  updated_at?: string
}

export interface Order {
  id: number
  doctor_id: number
  product_id: number
  date_of_service: string
  size: string
  units: number
  invoice_to_doc: number
  expected_collection_date: string
  msc_commission: number
  status: 'pending' | 'approved' | 'rejected'
  approved_by?: string
  approved_at?: string
  isEditing?: boolean
  created_at: string
  updated_at: string
  doctor?: Doctor
  product?: Product
  payment_date?: string
  payment_amount?: number
  payment_status?: string
}

export interface Rep {
  id: string
  name: string
  role: 'master' | 'sub' | 'sub-sub'
  commission_rate: number
  parent_rep_id?: string
  created_at?: string
  updated_at?: string
  parent_rep?: Rep
}

export interface Commission {
  id: string
  order_id: string
  rep_id: string
  commission_amount: number
  paid_date?: string
  created_at?: string
  updated_at?: string
  order?: Order
  rep?: Rep
}

export interface PricingHistory {
  id: string
  product_id: string
  quarter: string
  national_asp: number
  created_at?: string
  updated_at?: string
  product?: Product
}

export interface Payment {
  id: string
  order_id: string
  manufacturer_paid: number
  remaining_balance: number
  payment_date: string
  created_at?: string
  updated_at?: string
  order?: Order
}

export interface AuditLog {
  id: string
  user_id: string
  action: 'create' | 'update' | 'delete'
  table_name: string
  record_id: string
  changes: Record<string, any>
  timestamp: string
  user?: User
}

export interface CommissionStructure {
  id: number
  master_rep_id: number
  sub_rep_id?: number
  sub_sub_rep_id?: number
  master_rep_percentage: number
  sub_rep_percentage?: number
  sub_sub_rep_percentage?: number
  is_default: boolean
  created_by: string
  created_at: string
  updated_by?: string
  updated_at?: string
  commission_rate?: number
  effective_date?: string
  expiration_date?: string
}

export interface RepCommission {
  rep_id: string
  rep_name: string
  rep_type: 'master' | 'sub' | 'sub-sub'
  percentage: number
  amount: number
  default_percentage: number
}

export interface OrderCommission {
  total_commission: number
  commission_structure_id?: string
  master_rep_commission: RepCommission
  sub_rep_commission?: RepCommission
  sub_sub_rep_commission?: RepCommission
  last_modified_by?: string
  last_modified_at?: string
}

export interface RepProfile {
  rep_id: number
  rep_name: string
  commission_formula: string
}

export interface RepCommissionAgreement {
  id: string
  master_rep_id: string
  sub_rep_id: string
  commission_rate: number // The agreed commission rate between master and sub
  effective_from: string
  effective_to?: string
  status: 'active' | 'inactive'
  created_at: string
  created_by: string // Admin who created the agreement
  updated_at?: string
  updated_by?: string
}

export interface OrderCommissionBreakdown {
  order_id: number
  total_commission: number
  commissions: {
    rep_id: string
    rep_name: string
    rep_type: 'master' | 'sub' | 'sub-sub'
    commission_rate: number // Their actual rate for this order
    commission_amount: number
    base_rate: number // Their default commission rate
    effective_rate: number // The rate after splitting with sub-reps
  }[]
  created_at: string
  created_by: string
  updated_at?: string
  updated_by?: string
}

export interface PartialOrderCalculations {
  product?: Product
  repId?: string
  units?: number
  invoiceAmount?: number
  expectedCollectionDate?: string
  mscCommission?: number
}

export interface CommissionPeriod {
  period: string
  orders: number
  base_commission: number
  effective_commission: number
  sub_rep_share: number
}

export interface OrderCalculations {
  units: number
  invoiceAmount: number
  expectedCollectionDate: string
  mscCommission: number
  product: Product
  repId: string
  amount: number
  repCommissions: Array<{
    repId: string
    amount: number
  }>
}

// Helper types for filtering and querying
export interface OrderFilters {
  doctorId?: string
  productId?: string
  status?: Order['status']
  dateFrom?: string
  dateTo?: string
  repId?: string
}

export interface ReportFilters {
  dateFrom?: string
  dateTo?: string
  doctorId?: string
  productId?: string
  repId?: string
  type?: 'orders' | 'payments' | 'commissions'
}
