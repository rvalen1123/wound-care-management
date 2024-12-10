<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Navigation Menu -->
    <Navbar v-if="authStore.isAuthenticated" />

    <!-- Main Content -->
    <main>
      <router-view></router-view>
    </main>
  </div>
</template>

<script setup lang="ts">
import { onMounted } from 'vue';
import { useAuthStore } from './stores/auth';
import { Navbar } from './components/common/ui';

const authStore = useAuthStore();

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
