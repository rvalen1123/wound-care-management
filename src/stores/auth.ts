import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../lib/supabaseClient';
import type { User, Session } from '@supabase/supabase-js';

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const loading = ref(false);
  const error = ref<string | null>(null);

  // Computed
  const isAuthenticated = computed(() => !!user.value);

  // Actions
  const login = async (email: string, password: string) => {
    loading.value = true;
    error.value = null;

    try {
      console.log('Attempting login for:', email);

      if (!email?.trim() || !password) {
        throw new Error('Email and password are required');
      }

      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (loginError) throw loginError;
      if (!data?.user) throw new Error('No user data returned');

      user.value = data.user;
      session.value = data.session;

      console.log('Login successful for:', email);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during login';
      console.error('Login error:', errorMessage);
      error.value = errorMessage;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const logout = async () => {
    loading.value = true;
    error.value = null;

    try {
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;

      user.value = null;
      session.value = null;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An error occurred during logout';
      error.value = errorMessage;
      throw err;
    } finally {
      loading.value = false;
    }
  };

  const checkAuth = async () => {
    try {
      const { data: { session: currentSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      if (currentSession) {
        user.value = currentSession.user;
        session.value = currentSession;
      }
    } catch (err) {
      console.error('Error checking auth:', err);
      user.value = null;
      session.value = null;
    }
  };

  // Initialize auth state
  checkAuth();

  // Set up auth state change listener
  supabase.auth.onAuthStateChange((_event, newSession) => {
    user.value = newSession?.user || null;
    session.value = newSession;
  });

  return {
    // State
    user,
    loading,
    error,
    
    // Computed
    isAuthenticated,
    
    // Actions
    login,
    logout,
    checkAuth
  };
});
