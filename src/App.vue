<template>
  <div class="min-h-screen bg-gray-50">
    <!-- Navigation Menu -->
    <div v-if="isAuthenticated" class="bg-white shadow">
      <div class="max-w-7xl mx-auto px-4">
        <div class="flex justify-between h-16">
          <!-- Left side navigation -->
          <div class="flex">
            <router-link 
              to="/dashboard" 
              class="flex items-center px-4 text-gray-700 hover:text-green-600"
            >
              <font-awesome-icon icon="hospital" class="mr-2" />
              Wound Care Management
            </router-link>
          </div>

          <!-- Right side navigation -->
          <div class="flex items-center space-x-4">
            <span v-if="user" class="text-gray-600">
              {{ user.name }}
            </span>
            <PrimeButton
              icon="pi pi-sign-out"
              label="Logout"
              class="p-button-secondary p-button-text"
              @click="handleLogout"
            />
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

<script>
import { useAuth } from '@/services/auth.service'
import { useRouter } from 'vue-router'

export default {
  name: 'App',
  setup() {
    const router = useRouter()
    const { isAuthenticated, user, logout } = useAuth()

    const handleLogout = async () => {
      try {
        await logout()
        router.push('/login')
      } catch (error) {
        console.error('Logout Error:', error)
      }
    }

    return {
      isAuthenticated,
      user,
      handleLogout
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
