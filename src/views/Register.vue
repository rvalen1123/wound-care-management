<template>
  <div class="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
    <div class="sm:mx-auto sm:w-full sm:max-w-md">
      <img class="mx-auto h-12 w-auto" src="/msc-logo.png" alt="MSC Wound Care" />
      <h2 class="mt-6 text-center text-3xl font-extrabold text-white">Create admin account</h2>
    </div>

    <div class="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
      <div class="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10">
        <form class="space-y-6" @submit.prevent="handleSignUp">
          <div>
            <label for="name" class="block text-sm font-medium text-gray-400">Full Name</label>
            <div class="mt-1">
              <input
                id="name"
                v-model="name"
                type="text"
                required
                class="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

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
                minlength="6"
                class="appearance-none block w-full px-3 py-2 border border-gray-700 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          <div>
            <button
              type="submit"
              :disabled="authStore.loading"
              class="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-black bg-white hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white disabled:opacity-50"
            >
              {{ authStore.loading ? 'Creating account...' : 'Create Account' }}
            </button>
          </div>

          <div v-if="authStore.error" class="mt-4 text-sm text-red-400">
            {{ authStore.error }}
          </div>

          <div class="text-center mt-4">
            <router-link 
              to="/login" 
              class="text-sm text-indigo-400 hover:text-indigo-300"
            >
              Already have an account? Sign in
            </router-link>
          </div>
        </form>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { authService } from '../services/auth.service';

const router = useRouter();
const authStore = useAuthStore();

const name = ref('');
const email = ref('');
const password = ref('');

const handleSignUp = async () => {
  try {
    const { data: authData, error: signUpError } = await authService.signUp({
      email: email.value,
      password: password.value,
      options: {
        data: {
          role: 'admin',
          name: name.value
        }
      }
    });

    if (signUpError) throw signUpError;

    if (authData?.user) {
      // Create profile
      const { error: profileError } = await authService.createProfile({
        user_id: authData.user.id,
        email: email.value,
        role: 'admin',
        name: name.value,
        status: 'active'
      });

      if (profileError) throw profileError;

      // Redirect to login with success message
      router.push({ 
        path: '/login',
        query: { 
          message: 'Account created successfully. Please sign in.' 
        }
      });
    }
  } catch (err: any) {
    console.error('Registration error:', err);
    authStore.error = err.message || 'An error occurred during registration';
  }
};
</script>
