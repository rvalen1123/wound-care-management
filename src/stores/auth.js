import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { supabase } from '@/lib/supabaseClient';

/**
 * Auth store for managing user authentication state
 * Uses Supabase Auth for authentication and session management
 */
export const useAuthStore = defineStore('auth', () => {
  // State
  const user = ref(null);
  const session = ref(null);
  const isLoading = ref(false);
  const error = ref(null);
  const lastActivity = ref(null);

  // Computed properties
  const isAuthenticated = computed(() => !!session.value);
  const isAdmin = computed(() => user.value?.email && ADMIN_EMAILS.includes(user.value.email));

  // Admin emails configuration - consider moving to environment variables
  const ADMIN_EMAILS = [
    'drreddy@mscwoundcare.com',
    // Add other admin emails here
  ];

  /**
   * Updates the error state with a new error message
   * @param {Error|string|null} err - The error to set
   */
  const setError = (err) => {
    error.value = err ? (err.message || err) : null;
    if (err) {
      console.error('Auth error:', err);
    }
  };

  /**
   * Updates the user state with the latest user data
   * @param {Object} authUser - The authenticated user object from Supabase
   */
  const updateUserState = (authUser) => {
    try {
      if (!authUser) {
        user.value = null;
        return;
      }

      user.value = {
        id: authUser.id,
        email: authUser.email,
        name: authUser.user_metadata?.name || authUser.email,
        role: authUser.user_metadata?.role || 'user',
        provider: 'email',
        lastUpdated: new Date().toISOString()
      };

      lastActivity.value = new Date().toISOString();
    } catch (err) {
      setError('Failed to update user state: ' + err.message);
    }
  };

  /**
   * Tests the Supabase connection and returns detailed status
   * Uses cached session data when available
   */
  const testConnection = async () => {
    isLoading.value = true;
    setError(null);

    try {
      console.log('Testing Supabase connection...');

      // Use cached session if available
      if (session.value) {
        console.log('Using cached session:', {
          user: user.value?.email,
          lastActivity: lastActivity.value
        });

        return {
          success: true,
          error: null,
          details: {
            authService: 'Available (Cached)',
            dbConnection: 'Connected',
            currentUser: user.value?.email || 'Not logged in',
            authStatus: 'Authenticated',
            lastActivity: lastActivity.value
          }
        };
      }

      // Test auth service
      console.log('Testing auth service...');
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      // Test database connection
      console.log('Testing database connection...');
      const { error: dbError } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)
        .single();

      // Log successful connection
      console.log('Connection test completed successfully:', {
        authService: sessionData ? 'Available' : 'Not available',
        dbConnection: dbError ? 'Error' : 'Connected'
      });

      return {
        success: true,
        error: null,
        details: {
          authService: sessionData ? 'Available' : 'Not available',
          dbConnection: dbError ? 'Error' : 'Connected',
          currentUser: sessionData?.user?.email || 'Not logged in',
          authStatus: sessionData?.user ? 'Authenticated' : 'Not authenticated',
          lastActivity: lastActivity.value
        }
      };
    } catch (err) {
      const errorMessage = 'Connection test failed: ' + err.message;
      setError(errorMessage);
      return {
        success: false,
        error: errorMessage,
        details: {
          authService: 'Error',
          dbConnection: 'Error',
          currentUser: 'None',
          authStatus: 'Error',
          lastActivity: lastActivity.value
        }
      };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Logs in a user with email and password
   * @param {Object} credentials - Login credentials
   * @param {string} credentials.email - User's email
   * @param {string} credentials.password - User's password
   */
  const login = async ({ email, password }) => {
    isLoading.value = true;
    setError(null);

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

      console.log('Login successful for:', email);
      lastActivity.value = new Date().toISOString();

      // Session will be updated by onAuthStateChange listener
      return { data, error: null };
    } catch (err) {
      const errorMessage = 'Login failed: ' + err.message;
      setError(errorMessage);
      return { data: null, error: errorMessage };
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Logs out the current user
   */
  const logout = async () => {
    isLoading.value = true;
    setError(null);

    try {
      console.log('Logging out user:', user.value?.email);

      const { error: logoutError } = await supabase.auth.signOut();
      if (logoutError) throw logoutError;

      console.log('Logout successful');
      lastActivity.value = new Date().toISOString();

      // Session will be updated by onAuthStateChange listener
    } catch (err) {
      const errorMessage = 'Logout failed: ' + err.message;
      setError(errorMessage);
      throw err;
    } finally {
      isLoading.value = false;
    }
  };

  /**
   * Initializes the auth state and sets up auth state change listener
   */
  const initAuth = async () => {
    isLoading.value = true;
    setError(null);

    try {
      console.log('Initializing auth state...');

      // Get initial session
      const { data: { session: initialSession }, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) throw sessionError;

      session.value = initialSession;
      updateUserState(initialSession?.user);

      console.log('Initial auth state:', {
        authenticated: isAuthenticated.value,
        user: user.value?.email
      });

      // Listen for auth state changes
      const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, newSession) => {
        console.log('Auth state changed:', {
          event: _event,
          user: newSession?.user?.email
        });

        session.value = newSession;
        updateUserState(newSession?.user);
        lastActivity.value = new Date().toISOString();
      });

      // Clean up subscription on store cleanup
      return () => {
        console.log('Cleaning up auth subscription');
        subscription?.unsubscribe();
      };
    } catch (err) {
      const errorMessage = 'Auth initialization failed: ' + err.message;
      setError(errorMessage);
    } finally {
      isLoading.value = false;
    }
  };

  // Initialize auth state
  initAuth();

  return {
    // State
    user,
    session,
    isLoading,
    error,
    lastActivity,
    
    // Computed
    isAuthenticated,
    isAdmin,
    
    // Actions
    login,
    logout,
    testConnection,
    
    // Debug helpers
    setError
  };
});
