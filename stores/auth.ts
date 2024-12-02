import { defineStore } from 'pinia';
import { authService } from '../src/services/auth.service';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../src/services/auth.service';

interface AuthState {
  user: User | null;
  userRole: UserRole | null;
  loading: boolean;
  error: string | null;
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    userRole: null,
    loading: false,
    error: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.user,
    isAdmin: (state) => state.userRole?.role === 'admin',
    isRep: (state) => state.userRole?.role === 'rep',
    isDoctor: (state) => state.userRole?.role === 'doctor'
  },

  actions: {
    async login(email: string, password: string) {
      this.loading = true;
      this.error = null;
      
      try {
        const { data, error } = await authService.signIn(email, password);
        
        if (error) {
          this.error = error.message;
          return;
        }

        if (!data?.user) {
          this.error = 'Login failed';
          return;
        }

        this.user = data.user;
        const userRole = await authService.getUserRole();
        this.userRole = userRole;

      } catch (err) {
        this.error = err instanceof Error ? err.message : 'An error occurred';
      } finally {
        this.loading = false;
      }
    },

    async logout() {
      try {
        await authService.signOut();
        this.user = null;
        this.userRole = null;
      } catch (err) {
        this.error = err instanceof Error ? err.message : 'Logout failed';
      }
    },

    async checkAuth() {
      try {
        const user = await authService.getCurrentUser();
        if (user) {
          this.user = user;
          const userRole = await authService.getUserRole();
          this.userRole = userRole;
        }
      } catch (err) {
        console.error('Auth check failed:', err);
      }
    },

    clearError() {
      this.error = null;
    }
  }
});
