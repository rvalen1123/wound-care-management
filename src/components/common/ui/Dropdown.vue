<template>
  <div class="relative">
    <Dropdown
      v-model="modelValue"
      :options="options"
      :optionLabel="optionLabel"
      :optionValue="optionValue"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full',
        { 'p-invalid': error }
      ]"
      @change="handleChange"
    />
    <small v-if="error" class="text-red-500">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PrimeDropdown from 'primevue/dropdown'

interface Props {
  modelValue: any
  options: any[]
  optionLabel?: string
  optionValue?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  optionLabel: 'label',
  optionValue: 'value',
  placeholder: 'Select an option',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: any): void
  (e: 'change', event: any): void
}>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: any) => emit('update:modelValue', value)
})

const handleChange = (event: any) => {
  emit('change', event)
}
</script>

<style scoped>
.p-dropdown {
  width: 100%;
}

.p-dropdown-panel {
  z-index: 1000;
}

.p-dropdown.p-invalid {
  border-color: #ef4444;
}

.p-dropdown:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}
</style>
