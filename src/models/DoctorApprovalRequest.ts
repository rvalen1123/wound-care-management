export interface DoctorApprovalRequest {
  id: string;
  doctor_id: string;
  rep_id: string;
  status: 'pending' | 'approved' | 'rejected';
  created_at: string;
  updated_at?: string;
  doctor?: {
    name: string;
    email: string;
  };
}

export default DoctorApprovalRequest;
