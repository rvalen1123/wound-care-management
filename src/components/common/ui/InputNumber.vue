<template>
  <div class="relative">
    <InputNumber
      v-model="modelValue"
      :min="min"
      :max="max"
      :mode="mode"
      :currency="currency"
      :minFractionDigits="minFractionDigits"
      :maxFractionDigits="maxFractionDigits"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full',
        { 'p-invalid': error }
      ]"
      @input="handleInput"
    />
    <small v-if="error" class="text-red-500">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PrimeInputNumber from 'primevue/inputnumber'

interface Props {
  modelValue: number | null
  min?: number
  max?: number
  mode?: 'decimal' | 'currency'
  currency?: string
  minFractionDigits?: number
  maxFractionDigits?: number
  placeholder?: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  min: Number.MIN_SAFE_INTEGER,
  max: Number.MAX_SAFE_INTEGER,
  mode: 'decimal',
  currency: 'USD',
  minFractionDigits: 2,
  maxFractionDigits: 2,
  placeholder: 'Enter a number',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: number | null): void
  (e: 'input', value: number | null): void
}>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: number | null) => emit('update:modelValue', value)
})

const handleInput = (value: number | null) => {
  emit('input', value)
}
</script>

<style scoped>
.p-inputnumber {
  width: 100%;
}

.p-inputnumber-input {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.p-inputnumber.p-invalid .p-inputnumber-input {
  border-color: #ef4444;
}

.p-inputnumber-input:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
</style>
