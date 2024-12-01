<template>
  <div class="p-4">
    <h2 class="text-xl font-bold mb-4">Supabase Connection Test</h2>
    <button
      @click="testConnection"
      class="px-4 py-2 bg-[#003087] text-white rounded hover:bg-[#002266] disabled:opacity-50"
      :disabled="loading"
    >
      {{ loading ? 'Testing...' : 'Test Connection' }}
    </button>
    
    <div v-if="result" class="mt-4 space-y-2">
      <div
        :class="[
          'p-4 rounded',
          result.success ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
        ]"
      >
        {{ result.success ? 'Connection successful!' : `Connection failed: ${result.error}` }}
      </div>

      <div v-if="result.details" class="p-4 bg-gray-100 rounded">
        <h3 class="font-semibold mb-2">Connection Details:</h3>
        <ul class="space-y-1">
          <li>
            <span class="font-medium">Auth Service:</span> 
            {{ result.details.authService }}
          </li>
          <li>
            <span class="font-medium">Database Connection:</span> 
            {{ result.details.dbConnection }}
          </li>
          <li>
            <span class="font-medium">Auth Status:</span> 
            {{ result.details.authStatus }}
          </li>
          <li>
            <span class="font-medium">Current User:</span> 
            {{ result.details.currentUser }}
          </li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useAuthStore } from '@/stores/auth'

const authStore = useAuthStore()
const loading = ref(false)
const result = ref(null)

async function testConnection() {
  loading.value = true
  result.value = await authStore.testConnection()
  loading.value = false
}
</script>
