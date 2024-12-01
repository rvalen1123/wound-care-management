<template>
  <div class="flex min-h-full flex-1">
    <div class="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:flex-none lg:px-20 xl:px-24">
      <div class="mx-auto w-full max-w-sm lg:w-96">
        <div>
          <img class="h-16 w-auto" src="/msc-logo.png" alt="MSC Wound Care" />
          <h2 class="mt-8 text-2xl font-bold tracking-tight text-gray-900">Sign in to your account</h2>
          <p class="mt-2 text-sm text-gray-600">
            Need an account?
            {{ ' ' }}
            <button @click="handleRegister" class="font-semibold text-indigo-600 hover:text-indigo-500">
              Register here
            </button>
          </p>
        </div>

        <div class="mt-10">
          <div>
            <form @submit.prevent="handleLogin" class="space-y-6">
              <div>
                <label for="email" class="block text-sm font-medium text-gray-900">Email address</label>
                <div class="mt-2">
                  <input 
                    v-model.trim="email"
                    id="email" 
                    name="email" 
                    type="email" 
                    autocomplete="email" 
                    required
                    :disabled="loading"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm sm:leading-6"
                  />
                </div>
              </div>

              <div>
                <label for="password" class="block text-sm font-medium text-gray-900">Password</label>
                <div class="mt-2">
                  <input 
                    v-model="password"
                    id="password" 
                    name="password" 
                    type="password" 
                    autocomplete="current-password" 
                    required
                    :disabled="loading"
                    class="block w-full rounded-md border-0 py-1.5 text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 placeholder:text-gray-400 focus:ring-2 focus:ring-inset focus:ring-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed sm:text-sm sm:leading-6" 
                  />
                </div>
              </div>

              <div class="flex items-center justify-between">
                <div class="flex items-center">
                  <input id="remember-me" name="remember-me" type="checkbox" class="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-600" />
                  <label for="remember-me" class="ml-3 block text-sm text-gray-700">Remember me</label>
                </div>

                <div class="text-sm">
                  <a href="#" class="font-medium text-indigo-600 hover:text-indigo-500">Forgot your password?</a>
                </div>
              </div>

              <div>
                <button
                  type="submit"
                  :disabled="loading || !isFormValid"
                  class="flex w-full justify-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {{ loading ? 'Signing in...' : 'Sign in' }}
                </button>
              </div>

              <div v-if="error" class="rounded-md bg-red-50 p-4">
                <div class="flex">
                  <div class="flex-shrink-0">
                    <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor" aria-hidden="true">
                      <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z" clip-rule="evenodd" />
                    </svg>
                  </div>
                  <div class="ml-3">
                    <h3 class="text-sm font-medium text-red-800">{{ error }}</h3>
                  </div>
                </div>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
    <div class="relative hidden w-0 flex-1 lg:block">
      <img class="absolute inset-0 h-full w-full object-cover" src="https://images.unsplash.com/photo-1584515933487-779824d29309?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=2340&q=80" alt="Medical background" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const email = ref('');
const password = ref('');
const error = ref('');
const loading = ref(false);

const isFormValid = computed(() => {
  return email.value.trim() && password.value.trim();
});

function handleRegister() {
  router.push('/register');
}

async function handleLogin() {
  try {
    if (!isFormValid.value) {
      error.value = 'Please enter both email and password';
      return;
    }

    loading.value = true;
    error.value = '';

    const { error: loginError } = await authStore.login({
      email: email.value,
      password: password.value
    });

    if (loginError) {
      throw loginError;
    }

    router.push('/dashboard');
  } catch (err: unknown) {
    error.value = err instanceof Error ? err.message : 'Failed to sign in';
    console.error('Login error:', err);
  } finally {
    loading.value = false;
  }
}
</script>
