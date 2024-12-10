import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { authService } from '../services/auth.service';
import type { User } from '@supabase/supabase-js';
import type { UserRole } from '../services/auth.service';
import { useRouter } from 'vue-router';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const userRole = ref<UserRole | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);
  const authChecked = ref(false);

  // Router instance
  const router = useRouter();

  // Getters
  const isAuthenticated = computed(() => !!user.value);
  const isAdmin = computed(() => userRole.value?.role === 'admin');
  const isRep = computed(() => userRole.value?.role === 'rep');
  const isDoctor = computed(() => userRole.value?.role === 'doctor');

  // Actions
  async function login(email: string, password: string) {
    loading.value = true;
    error.value = null;
    
    try {
      const { data, error: signInError } = await authService.signIn(email, password);
      
      if (signInError) {
        error.value = signInError.message;
        return;
      }

      if (!data?.user) {
        error.value = 'Login failed';
        return;
      }

      user.value = data.user;
      const role = await authService.getUserRole();
      userRole.value = role;

      console.log('Login successful, user role:', role);

    } catch (err) {
      error.value = err instanceof Error ? err.message : 'An error occurred';
      throw err; // Propagate error to component for handling
    } finally {
      loading.value = false;
    }
  }

  async function logout() {
    try {
      await authService.signOut();
      user.value = null;
      userRole.value = null;
      // Clear auth check status
      authChecked.value = false;
      // Navigate to login page
      router.push('/login');
    } catch (err) {
      error.value = err instanceof Error ? err.message : 'Logout failed';
      throw err;
    }
  }

  async function checkAuth() {
    if (authChecked.value && user.value) {
      return; // Skip if already checked and authenticated
    }

    try {
      loading.value = true;
      const currentUser = await authService.getCurrentUser();
      
      if (currentUser) {
        user.value = currentUser;
        const role = await authService.getUserRole();
        userRole.value = role;
        console.log('Auth check successful, user role:', role);
      } else {
        user.value = null;
        userRole.value = null;
      }
    } catch (err) {
      console.error('Auth check failed:', err);
      user.value = null;
      userRole.value = null;
      throw err;
    } finally {
      authChecked.value = true;
      loading.value = false;
    }
  }

  // Subscribe to auth state changes
  authService.onAuthStateChange(async (newUser) => {
    try {
      if (newUser) {
        user.value = newUser;
        const role = await authService.getUserRole();
        userRole.value = role;
        console.log('Auth state changed, new user role:', role);
      } else {
        user.value = null;
        userRole.value = null;
        // If logged out, redirect to login page
        if (router.currentRoute.value.meta.requiresAuth) {
          router.push('/login');
        }
      }
    } catch (err) {
      console.error('Auth state change error:', err);
      user.value = null;
      userRole.value = null;
    }
  });

  function clearError() {
    error.value = null;
  }

  return {
    // State
    user,
    userRole,
    loading,
    error,
    authChecked,
    
    // Getters
    isAuthenticated,
    isAdmin,
    isRep,
    isDoctor,
    
    // Actions
    login,
    logout,
    checkAuth,
    clearError
  };
});
