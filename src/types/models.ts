export interface Order {
  id: string;
  date_of_service: string;
  doctor_id: string;
  product_id: string;
  invoice_to_doc: number;
  status: 'paid' | 'partial' | 'outstanding';
  doctor?: {
    name: string;
  };
}

export interface Representative {
  id: string;
  name: string;
  email: string;
  accountCount: number;
  subRepCount: number;
  totalSales: number;
  totalCommission: number;
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
