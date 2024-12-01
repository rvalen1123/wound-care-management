<template>
  <div class="min-h-screen bg-gray-900">
    <!-- Header -->
    <header class="bg-gray-800 shadow">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-bold text-white">{{ title }}</h1>
          <div class="flex items-center space-x-4">
            <slot name="actions"></slot>
          </div>
        </div>
        <div v-if="subtitle" class="mt-1">
          <p class="text-sm text-gray-400">{{ subtitle }}</p>
        </div>
      </div>
    </header>

    <!-- Main Content -->
    <main>
      <div class="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <!-- Loading State -->
        <div v-if="loading" class="flex justify-center items-center py-12">
          <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>

        <!-- Error State -->
        <div v-else-if="error" class="rounded-md bg-red-900 p-4 mb-4">
          <div class="flex">
            <div class="flex-shrink-0">
              <svg class="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path fill-rule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clip-rule="evenodd" />
              </svg>
            </div>
            <div class="ml-3">
              <h3 class="text-sm font-medium text-red-300">{{ error }}</h3>
            </div>
          </div>
        </div>

        <!-- Content -->
        <div v-else>
          <slot></slot>
        </div>
      </div>
    </main>

    <!-- Footer -->
    <footer v-if="$slots.footer" class="bg-gray-800 mt-auto">
      <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <slot name="footer"></slot>
      </div>
    </footer>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string
  subtitle?: string
  loading?: boolean
  error?: string | null
}>()
</script>

<style scoped>
.min-h-screen {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

main {
  flex: 1;
}
</style>
