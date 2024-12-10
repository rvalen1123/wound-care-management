import type { AuthUser, UserMetadata } from './models';

export interface AuthStore {
  user: AuthUser;
  userRole: UserMetadata | null;
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
