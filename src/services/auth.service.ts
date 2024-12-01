import { supabase } from '@/lib/supabaseClient';
import type { AuthError, User } from '@supabase/supabase-js';

export interface AuthResponse {
  user: User | null;
  error: AuthError | null;
}

export interface UserRole {
  role: 'admin' | 'rep' | 'doctor';
  name: string;
  rep_type?: 'master' | 'sub' | 'sub-sub';
  doctor_id?: string;
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

      // Verify user has required metadata
      const userRole = data.user.user_metadata?.role;
      if (!userRole) {
        console.error('User has no role assigned');
        return {
          user: null,
          error: new Error('User has no role assigned') as AuthError
        };
      }

      console.log('Login successful for:', email, 'with role:', userRole);
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

  async getUserRole(): Promise<UserRole | null> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return null;

    const metadata = user.user_metadata;
    if (!metadata?.role) return null;

    return {
      role: metadata.role,
      name: metadata.name,
      rep_type: metadata.rep_type,
      doctor_id: metadata.doctor_id
    };
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
};
