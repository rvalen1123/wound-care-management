<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Menu -->
    <div v-if="authStore.isAuthenticated" class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <!-- Left side navigation -->
          <div class="flex">
            <router-link 
              to="/dashboard" 
              class="flex items-center px-4 text-gray-700 hover:text-green-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
              Wound Care Management
            </router-link>
          </div>

          <!-- Right side navigation -->
          <div class="flex items-center space-x-4">
            <span v-if="authStore.user?.email" class="text-gray-600">
              {{ authStore.user.email }}
            </span>
            <button
              @click="handleLogout"
              class="inline-flex items-center px-4 py-2 text-sm font-medium text-gray-700 hover:text-green-600"
            >
              <svg xmlns="http://www.w3.org/2000/svg" class="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
              Logout
            </button>
          </div>
        </div>

        <!-- Sub navigation -->
        <nav class="flex space-x-8 py-2">
          <router-link 
            to="/dashboard" 
            class="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium"
            active-class="text-green-600 border-b-2 border-green-600"
          >
            Dashboard
          </router-link>
          <router-link 
            to="/graft-orders" 
            class="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium"
            active-class="text-green-600 border-b-2 border-green-600"
          >
            Graft Orders
          </router-link>
          <router-link 
            to="/customers" 
            class="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium"
            active-class="text-green-600 border-b-2 border-green-600"
          >
            Customers
          </router-link>
          <router-link 
            to="/financial-reports" 
            class="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium"
            active-class="text-green-600 border-b-2 border-green-600"
          >
            Financial Reports
          </router-link>
          <router-link 
            to="/payments" 
            class="text-gray-600 hover:text-green-600 px-3 py-2 text-sm font-medium"
            active-class="text-green-600 border-b-2 border-green-600"
          >
            Payments
          </router-link>
        </nav>
      </div>
    </div>

    <!-- Main Content -->
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth';

const router = useRouter();
const authStore = useAuthStore();

const handleLogout = async () => {
  try {
    await authStore.logout();
    router.push('/login');
  } catch (error) {
    console.error('Logout Error:', error instanceof Error ? error.message : error);
  }
};
</script>

<style>
#app {
  font-family: 'Inter', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
