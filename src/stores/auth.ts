import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '../utils/supabase';
import type { User, Session } from '@supabase/supabase-js';

interface UserMetadata {
  name?: string;
  role?: string;
}

export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref<User | null>(null);
  const session = ref<Session | null>(null);
  const isLoading = ref(false);
  const error = ref<string | null>(null);
  const lastActivity = ref<string | null>(null);

  // Computed properties
  const isAuthenticated = computed(() => !!session.value);
  const isAdmin = computed(() => user.value?.email && ADMIN_EMAILS.includes(user.value.email));

  // Admin emails configuration (from environment variables)
  const ADMIN_EMAILS = (import.meta.env.VITE_ADMIN_EMAILS || '').split(',');

  // Methods
  const setError = (err: Error | string | null) => {
    error.value = err ? (err instanceof Error ? err.message : err) : null;
    if (err) console.error('Auth error:', err);
  };

  const updateUserState = (authUser: User | null) => {
    if (!authUser) {
      user.value = null;
      return;
    }

    const metadata = authUser.user_metadata as UserMetadata;
    user.value = {
      id: authUser.id,
      email: authUser.email,
      name: metadata?.name || authUser.email,
      role: metadata?.role || 'user',
      provider: authUser.app_metadata?.provider || 'email',
      lastUpdated: new Date().toISOString(),
    };

    lastActivity.value = new Date().toISOString();
  };

  const testConnection = async () => {
    isLoading.value = true;
    setError(null);

    try {
      const { data: sessionData } = await supabase.auth.getSession();
      const { error: dbError } = await supabase.from('profiles').select('id').limit(1).single();

      return {
        success: true,
        error: null,
        details: {
          authService: sessionData ? 'Available' : 'Not available',
          dbConnection: dbError ? 'Error' : 'Connected',
          currentUser: sessionData.session?.user?.email || 'Not logged in',
        },
      };
    } catch (err) {
      const errorMessage = `Connection test failed: ${err instanceof Error ? err.message : err}`;
      setError(errorMessage);
      return { success: false, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  const login = async ({ email, password }: { email: string; password: string }) => {
    isLoading.value = true;
    setError(null);

    try {
      const { data, error: loginError } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (loginError) throw loginError;
      lastActivity.value = new Date().toISOString();

      return { data, error: null };
    } catch (err) {
      const errorMessage = `Login failed: ${err instanceof Error ? err.message : err}`;
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  const logout = async () => {
    isLoading.value = true;
    setError(null);

    try {
      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;

      lastActivity.value = new Date().toISOString();
    } catch (err) {
      const errorMessage = `Logout failed: ${err instanceof Error ? err.message : err}`;
      setError(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  const initAuth = async () => {
    isLoading.value = true;
    setError(null);

    try {
      const { data: { session: initialSession } } = await supabase.auth.getSession();
      session.value = initialSession;
      updateUserState(initialSession?.user || null);

      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        session.value = newSession;
        updateUserState(newSession?.user || null);
        lastActivity.value = new Date().toISOString();
      });

      return () => subscription?.unsubscribe();
    } catch (err) {
      setError(`Auth initialization failed: ${err instanceof Error ? err.message : err}`);
    } finally {
      isLoading.value = false;
    }
  };

  // Initialize auth state
  initAuth();

  return {
    user,
    session,
    isLoading,
    error,
    lastActivity,
    isAuthenticated,
    isAdmin,
    login,
    logout,
    testConnection,
    setError,
  };
});
