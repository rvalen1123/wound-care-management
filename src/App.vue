<template>
  <div id="app" class="min-h-screen bg-gray-100 font-sans">
    <nav class="bg-white shadow-md">
      <div class="container mx-auto px-6 py-4 flex justify-between items-center">
        <div class="flex items-center">
          <img src="@/assets/logo.png" alt="Wound Care Management" class="h-10 mr-4">
          <h1 class="text-xl font-bold text-green-700">Wound Care Management</h1>
        </div>
        <div class="space-x-4">
          <router-link 
            v-for="route in routes" 
            :key="route.path" 
            :to="route.path" 
            class="text-gray-600 hover:text-green-700 transition-colors"
          >
            {{ route.name }}
          </router-link>
        </div>
      </div>
    </nav>

    <main class="container mx-auto px-6 py-8">
      <router-view></router-view>
    </main>

    <footer class="bg-white shadow-md mt-8">
      <div class="container mx-auto px-6 py-4 text-center text-gray-600">
        {{ currentYear }} Wound Care Management Platform. All rights reserved.
      </div>
    </footer>
  </div>
</template>

<script>
export default {
  name: 'App',
  computed: {
    currentYear() {
      return new Date().getFullYear()
    },
    routes() {
      return [
        { path: '/', name: 'Dashboard' },
        { path: '/graft-orders', name: 'Graft Orders' },
        { path: '/customers', name: 'Customers' },
        { path: '/financial-reports', name: 'Financial Reports' },
        { path: '/payments', name: 'Payments' }
      ]
    }
  }
}
</script>

<style>
#app {
  font-family: 'Inter', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  color: #2c3e50;
}
</style>
