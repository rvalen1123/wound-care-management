<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-8">
        Wound Care Management Platform
      </h1>
      
      <form @submit.prevent="handleEmailLogin" class="space-y-4 mb-6">
        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            required
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
        </div>

        <button
          type="submit"
          :disabled="loading"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <div class="relative mb-6">
        <div class="absolute inset-0 flex items-center">
          <div class="w-full border-t border-gray-300"></div>
        </div>
        <div class="relative flex justify-center text-sm">
          <span class="px-2 bg-white text-gray-500">Or continue with</span>
        </div>
      </div>

      <div class="space-y-4">
        <button
          @click="handleGoogleAuth"
          type="button"
          class="w-full flex items-center justify-center gap-3 px-4 py-2 border border-gray-300 rounded-md shadow-sm bg-white text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
        >
          <img src="@/assets/google-icon.svg" alt="Google" class="w-5 h-5" />
          Sign in with Google
        </button>

        <div class="text-center">
          <router-link to="/register" class="text-sm text-indigo-600 hover:text-indigo-500">
            Don't have an account? Sign up
          </router-link>
        </div>
      </div>

      <div v-if="error" class="mt-4 p-4 bg-red-50 text-red-600 rounded text-sm">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

onMounted(async () => {
  // Check profiles table structure
  await authStore.checkProfilesTable()
})

const handleEmailLogin = async () => {
  try {
    loading.value = true
    error.value = ''

    const { error: loginError } = await authStore.login(email.value, password.value)

    if (loginError) {
      throw loginError
    }

    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || 'Failed to sign in'
  } finally {
    loading.value = false
  }
}

const handleGoogleAuth = async () => {
  try {
    error.value = ''
    await authStore.loginWithGoogle()
  } catch (err) {
    error.value = 'Authentication failed. Please try again.'
    console.error('Auth Error:', err)
  }
}

// Watch for authentication state changes
watch(() => authStore.isAuthenticated, (newValue) => {
  if (newValue) {
    router.push('/dashboard')
  }
})
</script>
