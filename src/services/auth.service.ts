import { supabase } from '../lib/supabaseClient';
import type { AuthError, User, SignUpWithPasswordCredentials, Session } from '@supabase/supabase-js';

export interface UserRole {
  role: 'admin' | 'rep' | 'doctor';
  name: string;
  rep_type?: 'master' | 'sub' | 'sub-sub';
  doctor_id?: string;
}

interface Profile {
  user_id: string;
  email: string;
  role: UserRole['role'];
  name: string;
  status: 'active' | 'inactive';
}

export interface AuthResponse {
  data: {
    user: User | null;
    session: Session | null;
  } | null;
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
        return { data: null, error };
      }

      if (!data?.user) {
        console.error('No user data returned');
        return { 
          data: null, 
          error: new Error('No user data returned') as AuthError 
        };
      }

      console.log('Login successful for:', email);
      return { data, error: null };
    } catch (err) {
      console.error('Login error:', err);
      return { 
        data: null, 
        error: err as AuthError 
      };
    }
  },

  async signUp(credentials: SignUpWithPasswordCredentials): Promise<AuthResponse> {
    try {
      const { data, error } = await supabase.auth.signUp(credentials);
      
      if (error) {
        console.error('Signup error:', error);
        return { data: null, error };
      }

      return { data, error: null };
    } catch (err) {
      console.error('Signup error:', err);
      return {
        data: null,
        error: err as AuthError
      };
    }
  },

  async createProfile(profile: Profile): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase
        .from('profiles')
        .insert([profile]);

      if (error) throw error;

      return { error: null };
    } catch (err) {
      console.error('Create profile error:', err);
      return { error: err as Error };
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
