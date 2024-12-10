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
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      return user;
    } catch (err) {
      console.error('Get current user error:', err);
      return null;
    }
  },

  async getUserRole(): Promise<UserRole | null> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();
      if (error) throw error;
      if (!user) return null;

      // First try to get role from user metadata
      if (user.user_metadata?.role) {
        return {
          role: user.user_metadata.role,
          name: user.user_metadata.name || user.email?.split('@')[0] || 'User',
          rep_type: user.user_metadata.rep_type,
          doctor_id: user.user_metadata.doctor_id
        };
      }

      // If not in metadata, try to get from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role, name, rep_type, doctor_id')
        .eq('user_id', user.id)
        .single();

      if (profileError) throw profileError;
      if (!profile) return null;

      return {
        role: profile.role,
        name: profile.name,
        rep_type: profile.rep_type,
        doctor_id: profile.doctor_id
      };
    } catch (err) {
      console.error('Get user role error:', err);
      return null;
    }
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user || null);
    });
  }
};
