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
  id: string
  doctor_id: string
  date_of_service: string
  product_id: string
  size: string
  units: number
  invoice_to_doc: number
  expected_collection_date: string
  status: 'pending' | 'approved' | 'paid' | 'partial' | 'outstanding'
  msc_commission: number
  approved_by?: string
  approved_at?: string
  created_at?: string
  updated_at?: string
  doctor?: Doctor
  product?: Product
  isEditing?: boolean
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

// Types for auto-calculations
export interface OrderCalculations {
  units: number
  invoiceAmount: number
  expectedCollectionDate: string
  mscCommission: number
  repCommissions: {
    repId: string
    amount: number
  }[]
}
