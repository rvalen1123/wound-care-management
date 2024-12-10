<template>
  <div class="text-center py-8">
    <div v-if="icon === 'history'" class="mx-auto h-12 w-12 text-gray-400">
      <svg class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    </div>
    <div v-else-if="icon === 'folder'" class="mx-auto h-12 w-12 text-gray-400">
      <svg class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" 
          d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2z" />
      </svg>
    </div>
    <div v-else-if="icon === 'document'" class="mx-auto h-12 w-12 text-gray-400">
      <svg class="h-full w-full" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
        <path vector-effect="non-scaling-stroke" stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
          d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z" />
      </svg>
    </div>
    
    <h3 v-if="title" class="mt-2 text-sm font-semibold" :class="theme === 'dark' ? 'text-gray-200' : 'text-gray-900'">
      {{ title }}
    </h3>
    
    <p class="mt-1 text-sm" :class="theme === 'dark' ? 'text-gray-400' : 'text-gray-500'">
      {{ message }}
    </p>
    
    <div v-if="$slots.action" class="mt-6">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  icon?: 'history' | 'folder' | 'document'
  title?: string
  message: string
  theme?: 'light' | 'dark'
}

withDefaults(defineProps<Props>(), {
  icon: 'document',
  title: '',
  theme: 'dark'
})</script>
