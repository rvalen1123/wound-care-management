export interface Order {
  id: number;
  doctor_id: number | null;
  product_id: number | null;
  date_of_service: string | null;
  size: string;
  units: number;
  invoice_to_doc: number;
  msc_commission: number;
  expected_collection_date: string | null;
  status: string;
  master_rep_id: number | null;
  sub_rep_id: number | null;
  sub_sub_rep_id: number | null;
}

export interface Product {
  id: number;
  name: string;
  sizes: string[];
}

export interface Representative {
  id: number;
  name: string;
  role: string;
}
