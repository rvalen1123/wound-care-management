declare module '@/stores/auth' {
  interface User {
    id: string;
    email: string;
    role: string;
  }

  interface AuthState {
    user: User | null;
    loading: boolean;
    error: string | null;
  }

  export function useAuthStore(): {
    user: User | null;
    loading: boolean;
    error: string | null;
    login: (email: string, password: string) => Promise<void>;
    logout: () => Promise<void>;
    checkAuth: () => Promise<void>;
  };
}
