<template>
  <div class="relative">
    <Calendar
      v-model="modelValue"
      :showIcon="showIcon"
      :maxDate="maxDate"
      :dateFormat="dateFormat"
      :placeholder="placeholder"
      :disabled="disabled"
      :class="[
        'w-full',
        { 'p-invalid': error }
      ]"
      @date-select="handleDateSelect"
    />
    <small v-if="error" class="text-red-500">{{ error }}</small>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import PrimeCalendar from 'primevue/calendar'

interface Props {
  modelValue: Date | null
  showIcon?: boolean
  maxDate?: Date
  dateFormat?: string
  placeholder?: string
  disabled?: boolean
  error?: string
}

const props = withDefaults(defineProps<Props>(), {
  showIcon: true,
  dateFormat: 'yy-mm-dd',
  placeholder: 'Select a date',
  disabled: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: Date | null): void
  (e: 'date-select', value: Date): void
}>()

const modelValue = computed({
  get: () => props.modelValue,
  set: (value: Date | null) => emit('update:modelValue', value)
})

const handleDateSelect = (value: Date) => {
  emit('date-select', value)
}
</script>

<style scoped>
.p-calendar {
  width: 100%;
}

.p-calendar-w-btn .p-inputtext {
  width: 100%;
  padding: 0.5rem;
  border-radius: 0.375rem;
  border: 1px solid #e2e8f0;
}

.p-calendar.p-invalid .p-inputtext {
  border-color: #ef4444;
}

.p-calendar .p-inputtext:disabled {
  background-color: #f3f4f6;
  cursor: not-allowed;
}

.p-datepicker {
  z-index: 1000;
}
</style>
