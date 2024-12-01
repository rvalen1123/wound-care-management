<template>
  <div class="flow-root">
    <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
      <div class="inline-block min-w-full py-2 align-middle">
        <table :class="[
          'min-w-full divide-y divide-gray-300',
          className
        ]">
          <thead v-if="$slots.header" :class="[
            headerClass
          ]">
            <slot name="header" />
          </thead>
          <tbody :class="[
            'divide-y divide-gray-200',
            bodyClass
          ]">
            <slot />
          </tbody>
          <tfoot v-if="$slots.footer" :class="[
            footerClass
          ]">
            <slot name="footer" />
          </tfoot>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps } from 'vue'

defineProps({
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
