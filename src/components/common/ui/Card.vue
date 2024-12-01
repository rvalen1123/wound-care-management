<template>
  <div :class="[
    'overflow-hidden bg-white',
    rounded ? 'rounded-lg' : '',
    shadow ? 'shadow-medical' : '',
    className
  ]">
    <div v-if="$slots.header" :class="[
      'border-b border-gray-200 px-4 py-5 sm:px-6',
      headerClass
    ]">
      <slot name="header" />
    </div>
    <div :class="[
      'px-4 py-5 sm:p-6',
      bodyClass
    ]">
      <slot />
    </div>
    <div v-if="$slots.footer" :class="[
      'border-t border-gray-200 px-4 py-4 sm:px-6',
      footerClass
    ]">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
  rounded: {
    type: Boolean,
    default: true
  },
  shadow: {
    type: Boolean,
    default: true
  },
  className: {
    type: String,
    default: ''
  },
  headerClass: {
    type: String,
    default: ''
  },
  bodyClass: {
    type: String,
    default: ''
  },
  footerClass: {
    type: String,
    default: ''
  }
})
</script>
