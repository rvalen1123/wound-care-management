<template>
  <div class="flex items-center justify-center min-h-screen bg-gray-100">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-8">
        Wound Care Management Platform
      </h1>
      
      <div class="space-y-4">
        <p class="text-center text-gray-600">
          Please sign in with your Google account to access the platform
        </p>
        
        <div id="googleButton"></div>

        <div class="flex justify-center">
          <PrimeButton
            v-if="!isAuthenticated"
            class="p-button-primary"
            label="Sign in with Google"
            icon="pi pi-google"
            @click="handleAuth"
          />
        </div>

        <PrimeButton
          v-if="isAuthenticated"
          class="w-full p-button-secondary"
          label="Sign Out"
          icon="pi pi-sign-out"
          @click="handleLogout"
        />
      </div>

      <div v-if="error" class="mt-4 p-4 bg-red-50 text-red-600 rounded">
        {{ error }}
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import { useAuth } from '@/services/auth.service'

export default {
  name: 'LoginPage',
  setup() {
    const router = useRouter()
    const error = ref('')
    const { isAuthenticated, login, logout, initGoogleAuth } = useAuth()

    const handleAuth = async () => {
      try {
        error.value = ''
        await login()
      } catch (err) {
        error.value = 'Authentication failed. Please try again.'
        console.error('Auth Error:', err)
      }
    }

    const handleLogout = async () => {
      try {
        error.value = ''
        await logout()
      } catch (err) {
        error.value = 'Logout failed. Please try again.'
        console.error('Logout Error:', err)
      }
    }

    // Watch for authentication state changes
    watch(isAuthenticated, (newValue) => {
      if (newValue) {
        router.push('/dashboard')
      }
    })

    onMounted(async () => {
      try {
        await initGoogleAuth()
      } catch (err) {
        error.value = 'Failed to initialize Google authentication.'
        console.error('Init Error:', err)
      }
    })

    return {
      isAuthenticated,
      error,
      handleAuth,
      handleLogout
    }
  }
}
</script>
