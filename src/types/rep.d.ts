export interface Representative {
  id: string;
  name: string;
  role: 'master' | 'sub' | 'sub-sub';
  parent_id?: string | null;
}

export interface CommissionAgreement {
  id: string;
  rep_id: string;
  commission_rate: number;
  effective_date: string;
}

export interface RepStoreState {
  reps: Representative[];
  commissionAgreements: CommissionAgreement[];
  loading: boolean;
  error: string | null;
  ytdCommission: number;
  lastYearCommission: number;
  monthlyOrders: number[];
  monthlyCommission: number[];
  recentOrders: any[];
}

export interface RepStore extends RepStoreState {
  getRepById: (id: string) => Representative | undefined;
  getRepsByRole: (role: string) => Representative[];
  getSubReps: (parentId: string) => Representative[];
  getSubSubReps: (parentId: string) => Representative[];
  getYTDCommission: () => number;
  fetchReps: () => Promise<void>;
  createRep: (rep: Partial<Representative>) => Promise<Representative>;
  updateRep: (id: string, updates: Partial<Representative>) => Promise<Representative>;
  deleteRep: (id: string) => Promise<void>;
  fetchCommissionAgreements: () => Promise<void>;
  updateCommissionAgreement: (repId: string, rate: number) => Promise<void>;
  calculateCommission: (orderId: string) => Promise<number>;
  generateCommissionReport: (startDate: string, endDate: string) => Promise<any>;
}
