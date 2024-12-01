export interface Doctor {
  id: string;
  name: string;
  email: string;
  phone?: string;
  address?: string;
  specialty?: string;
  created_at?: string;
  updated_at?: string;
}

export default Doctor;
