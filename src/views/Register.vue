<template>
  <div class="login-container">
    <div class="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
      <h1 class="text-2xl font-bold text-center text-gray-800 mb-8">
        Create Account
      </h1>
      
      <form @submit.prevent="handleRegister" class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-700">Name</label>
          <input
            v-model="name"
            type="text"
            required
            minlength="2"
            @blur="validateName"
            :class="{'border-red-500': nameError}"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p v-if="nameError" class="mt-1 text-sm text-red-600">{{ nameError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Email</label>
          <input
            v-model="email"
            type="email"
            required
            @blur="validateEmail"
            :class="{'border-red-500': emailError}"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p v-if="emailError" class="mt-1 text-sm text-red-600">{{ emailError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Role</label>
          <select
            v-model="role"
            required
            @blur="validateRole"
            :class="{'border-red-500': roleError}"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          >
            <option value="">Select a role</option>
            <option value="administration">Administration</option>
            <option value="sales_rep">Sales Rep</option>
            <option value="doctor">Doctor</option>
          </select>
          <p v-if="roleError" class="mt-1 text-sm text-red-600">{{ roleError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Password</label>
          <input
            v-model="password"
            type="password"
            required
            minlength="6"
            @blur="validatePassword"
            :class="{'border-red-500': passwordError}"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p v-if="passwordError" class="mt-1 text-sm text-red-600">{{ passwordError }}</p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-700">Confirm Password</label>
          <input
            v-model="confirmPassword"
            type="password"
            required
            @blur="validateConfirmPassword"
            :class="{'border-red-500': confirmPasswordError}"
            class="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
          />
          <p v-if="confirmPasswordError" class="mt-1 text-sm text-red-600">{{ confirmPasswordError }}</p>
        </div>

        <button
          type="submit"
          :disabled="loading || hasErrors"
          class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {{ loading ? 'Creating Account...' : 'Create Account' }}
        </button>

        <div v-if="error" class="p-4 bg-red-50 text-red-600 rounded text-sm">
          {{ error }}
        </div>

        <div class="text-center mt-4">
          <router-link to="/login" class="text-sm text-indigo-600 hover:text-indigo-500">
            Already have an account? Sign in
          </router-link>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRouter } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const name = ref('')
const email = ref('')
const password = ref('')
const confirmPassword = ref('')
const role = ref('')
const error = ref('')
const loading = ref(false)

// Validation errors
const nameError = ref('')
const emailError = ref('')
const roleError = ref('')
const passwordError = ref('')
const confirmPasswordError = ref('')

const validateName = () => {
  if (!name.value) {
    nameError.value = 'Name is required'
  } else if (name.value.length < 2) {
    nameError.value = 'Name must be at least 2 characters long'
  } else {
    nameError.value = ''
  }
}

const validateEmail = () => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!email.value) {
    emailError.value = 'Email is required'
  } else if (!emailRegex.test(email.value)) {
    emailError.value = 'Please enter a valid email address'
  } else {
    emailError.value = ''
  }
}

const validateRole = () => {
  if (!role.value) {
    roleError.value = 'Please select a role'
  } else {
    roleError.value = ''
  }
}

const validatePassword = () => {
  if (!password.value) {
    passwordError.value = 'Password is required'
  } else if (password.value.length < 6) {
    passwordError.value = 'Password must be at least 6 characters long'
  } else {
    passwordError.value = ''
  }
}

const validateConfirmPassword = () => {
  if (!confirmPassword.value) {
    confirmPasswordError.value = 'Please confirm your password'
  } else if (password.value !== confirmPassword.value) {
    confirmPasswordError.value = 'Passwords do not match'
  } else {
    confirmPasswordError.value = ''
  }
}

const hasErrors = computed(() => {
  return !!(nameError.value || emailError.value || roleError.value || 
    passwordError.value || confirmPasswordError.value)
})

const validateAll = () => {
  validateName()
  validateEmail()
  validateRole()
  validatePassword()
  validateConfirmPassword()
  return !hasErrors.value
}

async function handleRegister() {
  if (!validateAll()) {
    return
  }

  try {
    loading.value = true
    error.value = ''

    const { error: registerError } = await authStore.register({
      name: name.value,
      email: email.value,
      password: password.value,
      role: role.value
    })

    if (registerError) {
      throw registerError
    }

    // Show success message before redirecting
    error.value = 'Account created successfully! Redirecting to login...'
    setTimeout(() => {
      router.push('/login')
    }, 2000)
  } catch (err) {
    error.value = err.message || 'Failed to create account'
    console.error('Registration error details:', err)
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
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  padding: 1rem;
}
</style>
