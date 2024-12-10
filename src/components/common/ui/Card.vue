<template>
  <div :class="[
    theme === 'dark' ? 'bg-gray-800' : 'bg-white',
    rounded ? 'rounded-lg' : '',
    shadow ? (theme === 'dark' ? 'shadow-xl' : 'shadow-medical') : '',
    className
  ]">
    <div v-if="$slots.header" :class="[
      'border-b px-4 py-5 sm:px-6',
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
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
      'border-t px-4 py-4 sm:px-6',
      theme === 'dark' ? 'border-gray-700' : 'border-gray-200',
      footerClass
    ]">
      <slot name="footer" />
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  rounded?: boolean
  shadow?: boolean
  theme?: 'light' | 'dark'
  className?: string
  headerClass?: string
  bodyClass?: string
  footerClass?: string
}

withDefaults(defineProps<Props>(), {
  rounded: true,
  shadow: true,
  theme: 'dark',
  className: '',
  headerClass: '',
  bodyClass: '',
  footerClass: ''
})
</script>
