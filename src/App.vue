<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Loading State -->
    <div v-if="authStore.loading" class="flex items-center justify-center min-h-screen">
      <div class="text-white">Loading...</div>
    </div>

    <template v-else>
      <!-- Navigation Menu -->
      <Navbar v-if="authStore.isAuthenticated" />

      <!-- Main Content -->
      <main>
        <!-- Show router view only if authenticated or accessing auth routes -->
        <template v-if="authStore.isAuthenticated || isAuthRoute">
          <router-view></router-view>
        </template>

        <!-- Redirect to login if not authenticated and trying to access protected route -->
        <template v-else>
          <div class="flex items-center justify-center min-h-screen">
            <div class="max-w-md w-full mx-auto p-6">
              <img src="/msc-logo.png" alt="MSC Medical" class="h-12 mx-auto mb-8" />
              <div class="text-center">
                <h2 class="text-2xl font-bold text-white mb-4">Please Sign In</h2>
                <router-link 
                  to="/login"
                  class="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  Go to Login
                </router-link>
              </div>
            </div>
          </div>
        </template>
      </main>
    </template>
  </div>
</template>

<script setup lang="ts">
import { onMounted, computed } from 'vue';
import { useAuthStore } from './stores/auth';
import { Navbar } from './components/common/ui';
import { useRoute } from 'vue-router';

const authStore = useAuthStore();
const route = useRoute();

// Check if current route is an auth route (login/register)
const isAuthRoute = computed(() => {
  return ['/login', '/register'].includes(route.path);
});

onMounted(async () => {
  await authStore.checkAuth();
});
</script>

<style>
#app {
  font-family: 'Inter', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
