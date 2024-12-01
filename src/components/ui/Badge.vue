<template>
  <span :class="[
    'inline-flex items-center rounded-md px-2 py-1 text-xs font-medium ring-1 ring-inset',
    variant === 'success' ? 'text-medical-green-700 bg-medical-green-50 ring-medical-green-600/20' :
    variant === 'warning' ? 'text-logo-yellow-700 bg-logo-yellow-50 ring-logo-yellow-600/10' :
    variant === 'danger' ? 'text-logo-red-700 bg-logo-red-50 ring-logo-red-600/10' :
    variant === 'info' ? 'text-logo-blue-700 bg-logo-blue-50 ring-logo-blue-600/20' :
    'text-gray-700 bg-gray-50 ring-gray-600/10',
    className
  ]">
    <slot />
  </span>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  variant: {
    type: String,
    default: 'default',
    validator: (value) => ['success', 'warning', 'danger', 'info', 'default'].includes(value)
  },
  className: {
    type: String,
    default: ''
  }
})
</script>
