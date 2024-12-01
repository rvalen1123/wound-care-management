<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div class="flex justify-center mb-8">
        <img 
          src="/msc-logo.png" 
          alt="MSC Wound Care Logo" 
          class="h-16 w-auto"
        />
      </div>
      
      <form @submit.prevent="handleEmailLogin" class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-[#003087]">Email</label>
          <input
            v-model.trim="email"
            type="email"
            required
            autocomplete="username"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003087] focus:border-[#003087]"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-[#003087]">Password</label>
          <input
            v-model="password"
            type="password"
            required
            autocomplete="current-password"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-[#003087] focus:border-[#003087]"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003087] hover:bg-[#002266] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003087] disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>

        <div 
          v-if="error"
          class="p-4 bg-red-50 text-[#E31837] rounded text-sm"
        >
          {{ error }}
        </div>
      </form>

      <!-- Add the test component -->
      <div class="mt-8 pt-8 border-t">
        <TestSupabase />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
import TestSupabase from '@/components/TestSupabase.vue'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

async function handleEmailLogin() {
  try {
    loading.value = true
    error.value = ''

    console.log('Starting login process...')
    const { data, error: loginError } = await authStore.login({
      email: email.value,
      password: password.value
    })

    console.log('Login response in component:', { data, error: loginError })

    if (loginError) {
      throw loginError
    }

    if (!authStore.isAuthenticated) {
      throw new Error('Login succeeded but authentication state not set')
    }

    console.log('Login successful, redirecting to dashboard...')
    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || 'Failed to sign in'
    console.error('Login error in component:', err)
  } finally {
    loading.value = false
  }
}

// Watch for authentication state changes
watch(() => authStore.isAuthenticated, (newValue) => {
  if (newValue) {
    router.push('/dashboard')
  }
})
</script>
