<template>
  <div class="login-container">
    <div class="login-card bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <div class="flex justify-center mb-8">
        <img 
          src="/msc-logo.png" 
          alt="MSC Wound Care Logo" 
          class="h-16 w-auto"
        />
      </div>
      
      <form @submit.prevent="handleLogin" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-[#003087]">Email</label>
          <input
            v-model="email"
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

        <div class="flex gap-3">
          <button
            type="submit"
            :disabled="loading"
            class="flex-1 py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-[#003087] hover:bg-[#002266] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#003087] disabled:opacity-50"
          >
            {{ loading ? 'Logging in...' : 'Login' }}
          </button>
          
          <button
            type="button"
            @click="handleRegister"
            class="flex-1 py-2 px-4 border border-[#E31837] rounded-md shadow-sm text-sm font-medium text-[#E31837] bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E31837]"
          >
            Register
          </button>
        </div>

        <div 
          v-if="error"
          class="p-4 bg-red-50 text-[#E31837] rounded text-sm"
        >
          {{ error }}
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const email = ref('')
const password = ref('')
const error = ref('')
const loading = ref(false)

function handleRegister() {
  router.push('/register')
}

async function handleLogin() {
  try {
    loading.value = true
    error.value = ''

    const { error: loginError } = await authStore.login({
      email: email.value,
      password: password.value
    })

    if (loginError) {
      throw loginError
    }

    router.push('/dashboard')
  } catch (err) {
    error.value = err.message || 'Failed to sign in'
    console.error('Login error:', err)
  } finally {
    loading.value = false
  }
}
</script>

<style scoped>
.login-container {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  padding: 1rem;
}

.login-card {
  width: 100%;
  max-width: 400px;
}
</style>
