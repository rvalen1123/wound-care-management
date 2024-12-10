<template>
  <div class="commission-breakdown bg-gray-750 p-4 rounded-lg mt-4">
    <h4 class="text-lg font-medium text-gray-200 mb-4">Commission Breakdown</h4>
    
    <!-- Base Commission -->
    <div class="mb-4">
      <div class="flex justify-between items-center text-sm text-gray-400">
        <span>Base Commission Amount (15% of Invoice)</span>
        <span class="font-medium text-gray-200">${{ formatCurrency(commissionAmount) }}</span>
      </div>
    </div>

    <!-- Rep Commission Breakdown -->
    <div class="space-y-4">
      <!-- Master Rep -->
      <div v-if="masterRep" class="border-t border-gray-700 pt-4">
        <div class="flex justify-between items-center mb-2">
          <div>
            <span class="text-sm font-medium text-gray-200">{{ masterRep.name }}</span>
            <span class="text-xs text-gray-400 ml-2">(Master Rep)</span>
          </div>
          <span class="text-sm text-gray-200">${{ formatCurrency(masterCommission) }}</span>
        </div>
        <div class="text-xs text-gray-400">
          60% of base commission
        </div>
      </div>

      <!-- Sub Rep -->
      <div v-if="subRep" class="border-t border-gray-700 pt-4">
        <div class="flex justify-between items-center mb-2">
          <div>
            <span class="text-sm font-medium text-gray-200">{{ subRep.name }}</span>
            <span class="text-xs text-gray-400 ml-2">(Sub Rep)</span>
          </div>
          <span class="text-sm text-gray-200">${{ formatCurrency(subCommission) }}</span>
        </div>
        <div class="text-xs text-gray-400">
          40% of master rep commission
        </div>
      </div>

      <!-- Sub-Sub Rep -->
      <div v-if="subSubRep" class="border-t border-gray-700 pt-4">
        <div class="flex justify-between items-center mb-2">
          <div>
            <span class="text-sm font-medium text-gray-200">{{ subSubRep.name }}</span>
            <span class="text-xs text-gray-400 ml-2">(Sub-Sub Rep)</span>
          </div>
          <span class="text-sm text-gray-200">${{ formatCurrency(subSubCommission) }}</span>
        </div>
        <div class="text-xs text-gray-400">
          30% of sub rep commission
        </div>
      </div>
    </div>

    <!-- Total Distribution -->
    <div class="border-t border-gray-700 mt-4 pt-4">
      <div class="flex justify-between items-center">
        <span class="text-sm font-medium text-gray-200">Total Commission Distribution</span>
        <span class="text-sm font-medium text-gray-200">
          ${{ formatCurrency(totalDistribution) }}
        </span>
      </div>
      <div v-if="hasDiscrepancy" class="mt-2 text-xs text-yellow-400">
        Note: Remaining ${{ formatCurrency(commissionAmount - totalDistribution) }} held in reserve
      </div>
    </div>

    <!-- Warning Messages -->
    <div v-if="warnings.length > 0" class="mt-4 p-3 bg-yellow-900/50 rounded-md">
      <div v-for="(warning, index) in warnings" :key="index" class="text-sm text-yellow-400">
        ⚠️ {{ warning }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import type { Representative } from '@/types/models';

interface Props {
  commissionAmount: number;
  masterRepId: string | null;
  subRepId: string | null;
  subSubRepId: string | null;
  masterRep?: Representative;
  subRep?: Representative;
  subSubRep?: Representative;
}

const props = withDefaults(defineProps<Props>(), {
  commissionAmount: 0,
  masterRepId: null,
  subRepId: null,
  subSubRepId: null
});

const warnings = ref<string[]>([]);

// Commission Calculations
const masterCommission = computed(() => {
  if (!props.masterRepId) return 0;
  return Math.round((props.commissionAmount * 0.6) * 100) / 100;
});

const subCommission = computed(() => {
  if (!props.subRepId || !props.masterRepId) return 0;
  const subBase = masterCommission.value * 0.4;
  return Math.round(subBase * 100) / 100;
});

const subSubCommission = computed(() => {
  if (!props.subSubRepId || !props.subRepId) return 0;
  const subSubBase = subCommission.value * 0.3;
  return Math.round(subSubBase * 100) / 100;
});

const totalDistribution = computed(() => {
  let total = masterCommission.value;
  if (props.subRepId) {
    total += subCommission.value;
  }
  if (props.subSubRepId) {
    total += subSubCommission.value;
  }
  return Math.round(total * 100) / 100;
});

const hasDiscrepancy = computed(() => {
  return Math.abs(props.commissionAmount - totalDistribution.value) > 0.01;
});

// Validation
function validateCommissionStructure() {
  warnings.value = [];
  
  if (!props.masterRepId) {
    warnings.value.push('Master Rep is required for commission calculation');
  }

  if (props.subSubRepId && !props.subRepId) {
    warnings.value.push('Cannot assign Sub-Sub Rep without Sub Rep');
  }
}

// Watch for changes using computed properties
const repStructureChanged = computed(() => ({
  masterRepId: props.masterRepId,
  subRepId: props.subRepId,
  subSubRepId: props.subSubRepId
}));

// Run validation when rep structure changes
onMounted(() => {
  validateCommissionStructure();
});

// Watch for changes and validate
computed(() => {
  const _ = repStructureChanged.value; // Access the computed to track changes
  validateCommissionStructure();
});

// Utility Functions
function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(value);
}

// Expose commission structure for parent component
defineExpose({
  getCommissionStructure: () => ({
    master: masterCommission.value,
    sub: subCommission.value,
    subSub: subSubCommission.value,
    total: totalDistribution.value
  })
});
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgba(31, 41, 55, 0.5);
}
</style>
