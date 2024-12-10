<template>
  <div class="form-field">
    <label v-if="label" class="font-medium mb-2 block" :class="theme === 'dark' ? 'text-gray-300' : 'text-gray-700'">
      {{ label }}
      <span v-if="required" class="text-red-500">*</span>
    </label>
    <div class="relative">
      <input
        :type="type"
        :value="modelValue"
        @input="handleInput"
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
        :min="min"
        :max="max"
        :step="step"
        :required="required"
        :placeholder="placeholder"
      />
      <div v-if="type === 'number' && suffix" class="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
        <span class="text-gray-500 sm:text-sm">{{ suffix }}</span>
      </div>
    </div>
    <p v-if="error" class="mt-1 text-sm text-red-500">{{ error }}</p>
    <p v-else-if="hint" class="mt-1 text-sm" :class="theme === 'dark' ? 'text-gray-400' : 'text-gray-500'">
      {{ hint }}
    </p>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string | number;
  type?: 'text' | 'number' | 'email' | 'password';
  label?: string;
  placeholder?: string;
  required?: boolean;
  error?: string;
  hint?: string;
  min?: number;
  max?: number;
  step?: number;
  suffix?: string;
  theme?: 'light' | 'dark';
}

const props = withDefaults(defineProps<Props>(), {
  type: 'text',
  required: false,
  theme: 'dark'
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string | number): void
}>()

const handleInput = (event: Event) => {
  const target = event.target as HTMLInputElement
  let value: string | number = target.value
  
  if (props.type === 'number' && value !== '') {
    value = Number(value)
    // Ensure value is within min/max bounds
    if (props.max !== undefined) value = Math.min(value, props.max)
    if (props.min !== undefined) value = Math.max(value, props.min)
  }
  
  emit('update:modelValue', value)
}
</script>
