<template>
  <div class="mt-4 space-y-4">
    <h4 class="text-md font-medium text-gray-700">Commission Breakdown</h4>
    
    <!-- Master Rep Commission -->
    <div class="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
      <div>
        <span class="text-sm font-medium text-gray-600">Master Rep</span>
        <p class="text-xs text-gray-500">{{ masterRep?.name || 'Not assigned' }}</p>
      </div>
      <div class="text-right">
        <span class="text-sm font-medium text-gray-600">
          {{ formatCurrency(masterRepAmount) }}
        </span>
        <p class="text-xs text-gray-500">{{ masterRepRate }}% of total</p>
      </div>
    </div>

    <!-- Sub Rep Commission -->
    <div v-if="subRep" class="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
      <div>
        <span class="text-sm font-medium text-gray-600">Sub Rep</span>
        <p class="text-xs text-gray-500">{{ subRep.name }}</p>
      </div>
      <div class="text-right">
        <span class="text-sm font-medium text-gray-600">
          {{ formatCurrency(subRepAmount) }}
        </span>
        <p class="text-xs text-gray-500">{{ subRepRate }}% of total</p>
      </div>
    </div>

    <!-- Sub-Sub Rep Commission -->
    <div v-if="subSubRep" class="flex items-center justify-between bg-white p-3 rounded-lg shadow-sm">
      <div>
        <span class="text-sm font-medium text-gray-600">Sub-Sub Rep</span>
        <p class="text-xs text-gray-500">{{ subSubRep.name }}</p>
      </div>
      <div class="text-right">
        <span class="text-sm font-medium text-gray-600">
          {{ formatCurrency(subSubRepAmount) }}
        </span>
        <p class="text-xs text-gray-500">{{ subSubRepRate }}% of total</p>
      </div>
    </div>

    <!-- Total Commission -->
    <div class="flex items-center justify-between bg-gray-100 p-3 rounded-lg">
      <span class="text-sm font-medium text-gray-700">Total Commission</span>
      <span class="text-sm font-medium text-gray-700">
        {{ formatCurrency(commissionAmount) }}
      </span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { useRepStore } from '@/stores/repStore'
import type { Product, Representative } from '@/types/models'
import { formatCurrency } from '@/utils/formatters'

interface Props {
  commissionAmount: number;
  masterRepId: string | null;
  subRepId?: string | null;
  subSubRepId?: string | null;
  product: Product | null;
}

const props = defineProps<Props>()

const repStore = useRepStore()

// Get rep details
const masterRep = computed<Representative | null>(() => 
  props.masterRepId ? repStore.getRepById(props.masterRepId) : null
)

const subRep = computed<Representative | null>(() => 
  props.subRepId ? repStore.getRepById(props.subRepId) : null
)

const subSubRep = computed<Representative | null>(() => 
  props.subSubRepId ? repStore.getRepById(props.subSubRepId) : null
)

// Calculate commission rates based on hierarchy
const masterRepRate = computed(() => masterRep.value?.default_commission_rate || 0)
const subRepRate = computed(() => subRep.value?.default_commission_rate || 0)
const subSubRepRate = computed(() => subSubRep.value?.default_commission_rate || 0)

// Calculate commission amounts
const masterRepAmount = computed(() => 
  (props.commissionAmount * masterRepRate.value) / 100
)

const subRepAmount = computed(() => 
  props.subRepId ? (props.commissionAmount * subRepRate.value) / 100 : 0
)

const subSubRepAmount = computed(() => 
  props.subSubRepId ? (props.commissionAmount * subSubRepRate.value) / 100 : 0
)
</script>
