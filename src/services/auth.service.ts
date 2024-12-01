import { supabase } from '@/lib/supabaseClient';
import type { AuthError, User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      console.log('Attempting login for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password
      });

      if (error) {
        console.error('Login error:', error);
        return { user: null, error };
      }

      if (!data?.user) {
        console.error('No user data returned');
        return { 
          user: null, 
          error: new Error('No user data returned') as AuthError 
        };
      }

      console.log('Login successful for:', email);
      return { user: data.user, error: null };
    } catch (err) {
      console.error('Login error:', err);
      return { 
        user: null, 
        error: err as AuthError 
      };
    }
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
};
