export interface Order {
  id: string;
  doctor_id: string;
  date_of_service: string;
  product_id: string;
  size: string;
  units: number;
  invoice_to_doc: number;
  expected_collection_date?: string;
  status: 'paid' | 'partial' | 'outstanding' | 'pending' | 'approved';
  master_rep_id?: string;
  sub_rep_id?: string;
  sub_sub_rep_id?: string;
  commission_structure?: {
    master?: number;
    sub?: number;
    sub_sub?: number;
  };
  msc_commission?: number;
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at?: string;
  created_by?: string;
  updated_by?: string;
  doctor?: Doctor;
  product?: Product;
}

export interface Doctor {
  id: string;
  name: string;
  business_name?: string;
  email?: string;
  phone?: string;
  address?: string;
  default_credit_terms: string;
  created_at: string;
  updated_at?: string;
}

export interface Product {
  id: string;
  name: string;
  manufacturer: string;
  national_asp: number;
  size: string;
  default_commission_rate: number;
  created_at: string;
  updated_at?: string;
}

export interface Representative {
  id: string;
  name: string;
  email: string;
  accountCount?: number;
  subRepCount?: number;
  totalSales?: number;
  totalCommission?: number;
  created_at: string;
  updated_at?: string;
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
