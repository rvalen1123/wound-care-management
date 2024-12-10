<template>
  <div v-if="modelValue" class="fixed z-10 inset-0 overflow-y-auto">
    <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
      <!-- Background overlay -->
      <div class="fixed inset-0 transition-opacity" aria-hidden="true">
        <div class="absolute inset-0 bg-gray-900 opacity-75"></div>
      </div>

      <!-- Modal panel -->
      <div class="inline-block align-bottom bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
        <!-- Header -->
        <div v-if="$slots.header || title" class="mb-4">
          <slot name="header">
            <h3 class="text-lg leading-6 font-medium text-white">
              {{ title }}
            </h3>
          </slot>
        </div>

        <!-- Content -->
        <div class="mt-3 text-center sm:mt-0 sm:text-left">
          <slot></slot>
        </div>

        <!-- Footer -->
        <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
          <slot name="footer">
            <Button
              v-if="confirmLabel"
              :severity="confirmSeverity"
              :label="confirmLabel"
              class="sm:col-start-2"
              @click="$emit('confirm')"
              :disabled="confirmDisabled"
            />
            <Button
              v-if="cancelLabel"
              severity="secondary"
              :label="cancelLabel"
              class="mt-3 sm:mt-0 sm:col-start-1"
              @click="$emit('update:modelValue', false)"
            />
          </slot>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { Button } from './index'

interface Props {
  modelValue: boolean
  title?: string
  confirmLabel?: string
  cancelLabel?: string
  confirmSeverity?: 'primary' | 'success' | 'danger' | 'warning'
  confirmDisabled?: boolean
}

withDefaults(defineProps<Props>(), {
  title: '',
  confirmLabel: '',
  cancelLabel: 'Cancel',
  confirmSeverity: 'primary',
  confirmDisabled: false
})

defineEmits<{
  (e: 'update:modelValue', value: boolean): void
  (e: 'confirm'): void
}>()
</script>
