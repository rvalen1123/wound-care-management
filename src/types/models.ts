export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone: string;
  type: 'hospital' | 'clinic' | 'doctor';
  created_at: string;
  updated_at: string;
}

export interface Product {
  id: string;
  name: string;
  description: string;
  national_asp: number;
  sizes: string[];
  manufacturer: string;
  created_at: string;
  updated_at: string;
}

export interface Order {
  id: string;
  doctor_id: string;
  doctor: Doctor;
  product_id: string;
  product: Product;
  date_of_service: string;
  size: string;
  units: number;
  invoice_to_doc: number;
  msc_commission: number;
  expected_collection_date: string;
  status: 'pending' | 'approved' | 'paid' | 'partial' | 'outstanding';
  master_rep_id: string | null;
  sub_rep_id: string | null;
  sub_sub_rep_id: string | null;
  commission_structure: {
    master: number;
    sub: number;
    subSub: number;
  };
  approved_by?: string;
  approved_at?: string;
  created_at: string;
  updated_at: string;
  isEditing?: boolean;
}

export interface Representative {
  id: string;
  name: string;
  email: string;
  role: 'master' | 'sub' | 'sub-sub';
  parent_id?: string;
  default_commission_rate: number;
  created_at: string;
  updated_at: string;
}

export interface CommissionAgreement {
  id: string;
  rep_id: string;
  commission_rate: number;
  effective_date: string;
  created_at: string;
  updated_at: string;
}

export interface UserRole {
  user_id: string;
  role: 'admin' | 'user';
  created_at: string;
  updated_at: string;
}
