<template>
  <button
    :type="type"
    :class="[
      'inline-flex items-center justify-center rounded-md font-semibold shadow-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2',
      variant === 'primary' ? 'bg-logo-blue-600 text-white hover:bg-logo-blue-500 focus-visible:outline-logo-blue-600' :
      variant === 'secondary' ? 'bg-white text-gray-900 ring-1 ring-inset ring-gray-300 hover:bg-gray-50' :
      variant === 'danger' ? 'bg-logo-red-600 text-white hover:bg-logo-red-500 focus-visible:outline-logo-red-600' :
      'bg-medical-green-600 text-white hover:bg-medical-green-500 focus-visible:outline-medical-green-600',
      size === 'xs' ? 'px-2.5 py-1 text-xs' :
      size === 'sm' ? 'px-2.5 py-1.5 text-sm' :
      size === 'md' ? 'px-3.5 py-2 text-sm' :
      size === 'lg' ? 'px-4 py-2.5 text-sm' :
      'px-6 py-3 text-base',
      rounded ? 'rounded-full' : 'rounded-md',
      disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer',
      className
    ]"
    :disabled="disabled"
    @click="$emit('click', $event)"
  >
    <slot name="icon-left" />
    <slot />
    <slot name="icon-right" />
  </button>
</template>

<script setup>
import { defineEmits, defineProps } from 'vue'

defineProps({
  variant: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'danger', 'success'].includes(value)
  },
  size: {
    type: String,
    default: 'md',
    validator: (value) => ['xs', 'sm', 'md', 'lg', 'xl'].includes(value)
  },
  type: {
    type: String,
    default: 'button'
  },
  rounded: {
    type: Boolean,
    default: false
  },
  disabled: {
    type: Boolean,
    default: false
  },
  className: {
    type: String,
    default: ''
  }
})

defineEmits(['click'])
</script>
