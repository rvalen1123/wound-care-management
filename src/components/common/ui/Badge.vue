<template>
  <span :class="[
    'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
    theme === 'dark' ? getDarkClasses : getLightClasses,
    className
  ]">
    <slot />
  </span>
</template>

<script setup lang="ts">
import { computed } from 'vue'

interface Props {
  severity?: 'success' | 'warning' | 'danger' | 'info' | 'default'
  theme?: 'light' | 'dark'
  className?: string
}

const props = withDefaults(defineProps<Props>(), {
  severity: 'default',
  theme: 'dark',
  className: ''
})

const getDarkClasses = computed(() => {
  switch (props.severity) {
    case 'success':
      return 'bg-green-900/30 text-green-400 ring-green-400/30'
    case 'warning':
      return 'bg-yellow-900/30 text-yellow-400 ring-yellow-400/30'
    case 'danger':
      return 'bg-red-900/30 text-red-400 ring-red-400/30'
    case 'info':
      return 'bg-blue-900/30 text-blue-400 ring-blue-400/30'
    default:
      return 'bg-gray-900/30 text-gray-400 ring-gray-400/30'
  }
})

const getLightClasses = computed(() => {
  switch (props.severity) {
    case 'success':
      return 'bg-green-50 text-green-700 ring-green-600/20'
    case 'warning':
      return 'bg-yellow-50 text-yellow-700 ring-yellow-600/20'
    case 'danger':
      return 'bg-red-50 text-red-700 ring-red-600/20'
    case 'info':
      return 'bg-blue-50 text-blue-700 ring-blue-600/20'
    default:
      return 'bg-gray-50 text-gray-700 ring-gray-600/20'
  }
})
</script>
