<template>
  <div class="modal">
    <div class="modal-content">
      <h2>Add New Order</h2>
      <!-- Add your form content here -->
      <div class="actions">
        <button @click="$emit('close')">Cancel</button>
        <button @click="handleSubmit">Save</button>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
const emit = defineEmits<{
  (e: 'close'): void
  (e: 'order-added'): void
}>()

const handleSubmit = () => {
  // Add form submission logic here
  emit('order-added')
}
</script> 