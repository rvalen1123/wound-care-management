<template>
  <div class="min-h-screen flex items-center justify-center bg-gray-900 py-12 px-4 sm:px-6 lg:px-8">
    <div class="max-w-md w-full space-y-8">
      <!-- Logo and Title -->
      <div>
        <img class="mx-auto h-16 w-auto" src="/msc-logo.png" alt="MSC Wound Care">
        <h2 class="mt-6 text-center text-3xl font-extrabold text-white">
          Sign in to your account
        </h2>
      </div>

      <!-- Login Form -->
      <form class="mt-8 space-y-6" @submit.prevent="handleSubmit">
        <div class="rounded-md shadow-sm space-y-4">
          <!-- Email Input -->
          <div>
            <label for="email-address" class="block text-sm font-medium text-gray-300">Email address</label>
            <input
              id="email-address"
              name="email"
              type="email"
              autocomplete="email"
              required
              v-model="formData.email"
              :disabled="formData.loading"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your email"
              @blur="validateEmail"
            >
            <p v-if="formData.emailError" class="mt-1 text-sm text-red-400">{{ formData.emailError }}</p>
          </div>

          <!-- Password Input -->
          <div>
            <label for="password" class="block text-sm font-medium text-gray-300">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              autocomplete="current-password"
              required
              v-model="formData.password"
              :disabled="formData.loading"
              class="mt-1 appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-800 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              placeholder="Enter your password"
              @blur="validatePassword"
            >
            <p v-if="formData.passwordError" class="mt-1 text-sm text-red-400">{{ formData.passwordError }}</p>
          </div>
        </div>

        <!-- Error Message -->
        <div v-if="formData.error" class="rounded-md bg-red-900 p-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-300">
                {{ formData.error }}
              </h3>
            </div>
          </div>
        </div>

        <!-- Remember Me and Forgot Password -->
        <div class="flex items-center justify-between">
          <div class="flex items-center">
            <input
              id="remember-me"
              name="remember-me"
              type="checkbox"
              v-model="formData.rememberMe"
              class="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-700 bg-gray-800 rounded"
            >
            <label for="remember-me" class="ml-2 block text-sm text-gray-300">
              Remember me
            </label>
          </div>

          <div class="text-sm">
            <a href="#" class="font-medium text-indigo-400 hover:text-indigo-300">
              Forgot your password?
            </a>
          </div>
        </div>

        <!-- Submit Button -->
        <div>
          <button
            type="submit"
            :disabled="formData.loading || !isValid"
            class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <svg
              v-if="formData.loading"
              class="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
              <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            {{ formData.loading ? 'Signing in...' : 'Sign in' }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

// Form state using a reactive object
const formData = ref({
  email: '',
  password: '',
  rememberMe: false,
  error: null as string | null,
  emailError: null as string | null,
  passwordError: null as string | null,
  loading: false
});

// Validation
const validateEmail = () => {
  formData.value.emailError = null;
  const email = formData.value.email.trim();
  
  if (!email) {
    formData.value.emailError = 'Email is required';
    return false;
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    formData.value.emailError = 'Please enter a valid email address';
    return false;
  }
  return true;
};

const validatePassword = () => {
  formData.value.passwordError = null;
  if (!formData.value.password) {
    formData.value.passwordError = 'Password is required';
    return false;
  }
  if (formData.value.password.length < 6) {
    formData.value.passwordError = 'Password must be at least 6 characters';
    return false;
  }
  return true;
};

const isValid = computed(() => {
  return formData.value.email && 
         formData.value.password && 
         !formData.value.emailError && 
         !formData.value.passwordError;
});

// Form submission
const handleSubmit = async () => {
  if (formData.value.loading || !isValid.value) return;
  
  // Clear previous errors
  formData.value.error = null;
  formData.value.emailError = null;
  formData.value.passwordError = null;

  // Validate form
  if (!validateEmail() || !validatePassword()) {
    return;
  }

  formData.value.loading = true;

  try {
    // Log form data (excluding password)
    console.log('Form submission:', {
      email: formData.value.email,
      hasPassword: !!formData.value.password,
      rememberMe: formData.value.rememberMe
    });

    // Attempt login
    await authStore.login(formData.value.email.trim(), formData.value.password);
    
    // Get user role from metadata
    const userRole = authStore.userRole?.role;
    console.log('Login successful, user role:', userRole);
    
    if (!userRole) {
      formData.value.error = 'Login failed: User role not found';
      await authStore.logout();
      return;
    }

    // Redirect based on role
    const redirectPath = (route.query.redirect as string) || getDefaultRoute(userRole);
    console.log('Redirecting to:', redirectPath);
    router.push(redirectPath);
  } catch (err) {
    console.error('Login error:', err);
    formData.value.error = err instanceof Error ? err.message : 'An error occurred during sign in';
  } finally {
    formData.value.loading = false;
  }
};

const getDefaultRoute = (role: string): string => {
  switch (role) {
    case 'admin':
      return '/dashboard';
    case 'rep':
      return '/rep/dashboard';
    case 'doctor':
      return '/doctor/dashboard';
    default:
      throw new Error('Invalid user role');
  }
};
</script>
