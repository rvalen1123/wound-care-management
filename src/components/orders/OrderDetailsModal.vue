<template>
  <div class="modal">
    <!-- Add your modal content here -->
  </div>
</template>

<script setup lang="ts">
import { defineProps, defineEmits } from 'vue'

defineProps<{
  order: {
    order_id: string
    doctor_id: string
    product_id: string
    status: string
    date_of_service: string
    invoice_amount_billed: number
    msc_commission: number
  }
}>()

const emit = defineEmits<{
  (e: 'close'): void
  (e: 'order-updated'): void
}>()
</script>