import { supabase } from '@/lib/supabaseClient'
import type { AuthResponse, User } from '@/types'

export const authService = {
  async signIn(email: string, password: string): Promise<AuthResponse> {
    try {
      const { data: { user }, error } = await supabase.auth.signInWithPassword({
        email,
        password
      })

      if (error) throw error

      return { user: user as User, error: null }
    } catch (error) {
      return { user: null, error: error as Error }
    }
  },

  async signOut(): Promise<void> {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  async getCurrentUser(): Promise<User | null> {
    const { data: { user } } = await supabase.auth.getUser()
    return user as User | null
  },

  onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange((_event, session) => {
      callback(session?.user as User || null)
    })
  },

  async resetPassword(email: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email)
      return { error: error }
    } catch (error) {
      return { error: error as Error }
    }
  },

  async updatePassword(password: string): Promise<{ error: Error | null }> {
    try {
      const { error } = await supabase.auth.updateUser({ password })
      return { error }
    } catch (error) {
      return { error: error as Error }
    }
  }
}
