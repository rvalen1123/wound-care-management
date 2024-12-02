import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../services/auth.service';

export interface AuthStore {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isRep: boolean;
  isDoctor: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  clearError: () => void;
}
