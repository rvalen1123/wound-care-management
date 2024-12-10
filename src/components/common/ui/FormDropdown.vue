<template>
  <div class="form-field">
    <label v-if="label" class="font-medium mb-2 block" :class="theme === 'dark' ? 'text-gray-300' : 'text-gray-700'">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <select
        :value="modelValue"
        @input="$emit('update:modelValue', ($event.target as HTMLSelectElement).value)"
        class="block w-full rounded-md shadow-sm focus:ring-2 focus:ring-offset-2 text-sm"
        :class="[
          theme === 'dark' ? [
            'bg-gray-700',
            'border-gray-600',
            'text-gray-200',
            'focus:ring-blue-500',
            'focus:border-blue-500'
          ] : [
            'bg-white',
            'border-gray-300',
            'text-gray-900',
            'focus:ring-indigo-500',
            'focus:border-indigo-500'
          ],
          error ? 'border-red-500' : ''
        ]"
        :required="required"
      >
        <option value="" disabled selected>{{ placeholder }}</option>
        <option
          v-for="option in options"
          :key="getOptionValue(option)"
          :value="getOptionValue(option)"
        >
          {{ getOptionLabel(option) }}
        </option>
      </select>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm" :class="theme === 'dark' ? 'text-gray-400' : 'text-gray-500'">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: any;
  options: any[];
  optionLabel?: string;
  optionValue?: string;
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  theme?: 'light' | 'dark';
}

const props = withDefaults(defineProps<Props>(), {
  optionLabel: 'label',
  optionValue: 'value',
  placeholder: 'Select an option',
  required: false,
  theme: 'dark'
})

defineEmits<{
  (e: 'update:modelValue', value: any): void
}>()

const getOptionLabel = (option: any) => {
  if (typeof option === 'object') {
    return option[props.optionLabel]
  }
  return option
}

const getOptionValue = (option: any) => {
  if (typeof option === 'object') {
    return option[props.optionValue]
  }
  return option
}
</script>
