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
      const { error } = await supabase.auth.signInWithOAuth({
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

  const login = async (credentials) => {
    try {
      console.log('Login attempt with:', credentials)
      
      if (!credentials?.email || !credentials?.password) {
        throw new Error('Email and password are required')
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email.trim(),
        password: credentials.password
      })

      if (error) throw error

      // Get user profile from profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('name, role')
        .eq('id', data.user.id)
        .single()

      if (profileError && profileError.code !== 'PGRST116') {
        console.error('Profile fetch error:', profileError)
      }

      user.value = {
        id: data.user.id,
        email: data.user.email,
        name: profile?.name || data.user.user_metadata?.name,
        role: profile?.role || data.user.user_metadata?.role,
        provider: 'email'
      }
      
      isAdmin.value = ADMIN_EMAILS.includes(credentials.email.trim())
      isAuthenticated.value = true

      return { data, error: null }
    } catch (error) {
      console.error('Login error:', error)
      return { data: null, error }
    }
  }

  const register = async ({ name, email, password, role }) => {
    try {
      const { data: authData, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            role
          }
        }
      })

      if (signUpError) throw signUpError

      if (authData.user) {
        // Create profile entry
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: authData.user.id,
              name,
              role,
              email
            }
          ])
          .select()

        if (profileError) {
          console.error('Error creating profile:', profileError)
          // Delete the user if profile creation fails
          await supabase.auth.admin.deleteUser(authData.user.id)
          throw new Error('Failed to create user profile')
        }

        user.value = {
          id: authData.user.id,
          email,
          name,
          role,
          provider: 'email'
        }
        isAuthenticated.value = true
        isAdmin.value = ADMIN_EMAILS.includes(email)
      }

      return { data: authData, error: null }
    } catch (error) {
      console.error('Registration error:', error)
      return { data: null, error }
    }
  }

  const logout = async () => {
    try {
      const { error } = await supabase.auth.signOut()
      if (error) throw error

      user.value = null
      isAuthenticated.value = false
      isAdmin.value = false
    } catch (error) {
      console.error('Logout error:', error)
      throw error
    }
  }

  const checkProfilesTable = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('id')
        .limit(1)

      if (error) {
        console.error('Error checking profiles table:', error)
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

  const initAuth = async () => {
    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (session) {
        // Get user profile from profiles table
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError)
        }

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
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('name, role')
          .eq('id', session.user.id)
          .single()

        if (profileError && profileError.code !== 'PGRST116') {
          console.error('Profile fetch error:', profileError)
        }

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
        console.error('Auth state change error:', error)
      }
    } else if (event === 'SIGNED_OUT') {
      user.value = null
      isAuthenticated.value = false
      isAdmin.value = false
    }
  })

  return {
    user,
    isAuthenticated,
    isAdmin,
    login,
    loginWithGoogle,
    register,
    logout,
    checkProfilesTable,
    initAuth
  }
})
