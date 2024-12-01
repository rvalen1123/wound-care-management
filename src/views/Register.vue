<template>
  <div class="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-12 w-auto" src="../assets/msc-logo.png" alt="MSC Wound Care" />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-white">Create admin account</h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSignUp">
          <div>
            <label for="email" class="block text-sm font-medium text-gray-400">Email address</label>
            <div class="mt-1">
              <input
                id="email"
                v-model="email"
                type="email"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label for="password" class="block text-sm font-medium text-gray-400">Password</label>
            <div class="mt-1">
              <input
                id="password"
                v-model="password"
                type="password"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white disabled:opacity-50"
            >
              {{ loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </div>

          <div v-if="error" class="mt-4 text-sm text-red-400">
            {{ error }}
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { supabase } from '../lib/supabaseClient'

const router = useRouter()
const loading = ref(false)
const email = ref('')
const password = ref('')
const error = ref('')

const handleSignUp = async () => {
  try {
    loading.value = true
    error.value = ''

    // Sign up the user
    const { data: authData, error: signUpError } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          role: 'admin'
        }
      }
    })

    if (signUpError) throw signUpError

    if (authData.user) {
      // Create profile
      const { error: profileError } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: authData.user.id,
            email: email.value,
            role: 'admin',
            name: 'Test Admin',
            status: 'active'
          }
        ])

      if (profileError) throw profileError

      // Redirect to login
      router.push('/login')
    }
  } catch (err: any) {
    console.error('Error:', err)
    error.value = err.message || 'An error occurred during sign up'
  } finally {
    loading.value = false
  }
}
</script>
