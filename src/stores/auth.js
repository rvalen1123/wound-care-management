import { defineStore } from 'pinia'
import { ref } from 'vue'
import { supabase } from '@/lib/supabase'

export const useAuthStore = defineStore('auth', () => {
  const user = ref(null)
  const isAuthenticated = ref(false)
  const isAdmin = ref(false)

  // List of admin email addresses
  const ADMIN_EMAILS = [
    'richard@woundcaregrafts.com',
    // Add other admin emails here
  ]

  const loginWithGoogle = async () => {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
      
    } catch (error) {
      console.error('Google Auth Error:', error)
      throw error
    }
  }

  const login = async (email, password) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) throw error

      user.value = {
        id: data.user.id,
        email: data.user.email,
        provider: 'email'
      }
      isAdmin.value = ADMIN_EMAILS.includes(email)
      isAuthenticated.value = true
      
      return { error: null }
    } catch (error) {
      console.error('Login Error:', error)
      return { error }
    }
  }

  const register = async ({ name, email, password, role }) => {
    try {
      console.log('Starting registration process for:', email)

      // First, sign up the user
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role,
          },
        },
      })

      if (error) {
        console.error('Supabase auth signup error:', error)
        throw error
      }

      console.log('User signed up successfully:', data.user.id)

      // After successful registration, create a profile in the profiles table
      if (data?.user) {
        const profileData = {
          id: data.user.id,
          name,
          email,
          role,
          created_at: new Date().toISOString(),
        }
        
        console.log('Creating profile with data:', profileData)

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([profileData])

        if (profileError) {
          console.error('Error creating profile:', profileError)
          // If profile creation fails, we should delete the user
          try {
            await supabase.auth.admin.deleteUser(data.user.id)
            console.log('Cleaned up user after profile creation failure')
          } catch (deleteError) {
            console.error('Error cleaning up user:', deleteError)
          }
          throw new Error(`Failed to create user profile: ${profileError.message}`)
        }

        console.log('Profile created successfully')
      }

      return { error: null }
    } catch (error) {
      console.error('Registration Error:', error)
      return { 
        error: {
          message: error.message || 'Failed to create account',
          details: error
        }
      }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      // Clear local state
      user.value = null
      isAuthenticated.value = false
      isAdmin.value = false
    } catch (error) {
      console.error('Logout Error:', error)
      throw error
    }
  }

  // Check profiles table structure
  const checkProfilesTable = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select()
        .limit(1)

      if (error) {
        console.error('Error checking profiles table:', error.message)
        return false
      }

      // Log the columns we get back
      if (data && data[0]) {
        console.log('Profile table columns:', Object.keys(data[0]))
      }

      return true
    } catch (error) {
      console.error('Error:', error)
      return false
    }
  }

  // Initialize auth state from Supabase session
  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Get user profile from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        user.value = {
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.user_metadata?.name,
          role: profile?.role || session.user.user_metadata?.role,
          provider: session.user.app_metadata?.provider || 'email'
        }
        isAdmin.value = ADMIN_EMAILS.includes(session.user.email)
        isAuthenticated.value = true
      }
    } catch (error) {
      console.error('Error initializing auth:', error)
    }
  }

  // Listen for auth state changes
  supabase.auth.onAuthStateChange(async (event, session) => {
    if (event === 'SIGNED_IN' && session) {
      try {
        // Get user profile from profiles table
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single()

        user.value = {
          id: session.user.id,
          email: session.user.email,
          name: profile?.name || session.user.user_metadata?.name,
          role: profile?.role || session.user.user_metadata?.role,
          provider: session.user.app_metadata?.provider || 'email'
        }
        isAdmin.value = ADMIN_EMAILS.includes(session.user.email)
        isAuthenticated.value = true
      } catch (error) {
        console.error('Error fetching user profile:', error)
      }
    } else if (event === 'SIGNED_OUT') {
      user.value = null
      isAuthenticated.value = false
      isAdmin.value = false
    }
  })

  // Initialize auth state when store is created
  initAuth()

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    loginWithGoogle,
    register,
    logout,
    checkProfilesTable
  }
})
