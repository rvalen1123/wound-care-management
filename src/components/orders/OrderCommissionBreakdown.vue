<template>
  <div class="space-y-6">
    <div v-if="isAdmin" class="bg-white rounded-lg shadow p-4">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Commission Structure</h4>
      
      <!-- Commission Form -->
      <form @submit.prevent="handleCommissionUpdate" class="space-y-4">
        <!-- Master Rep -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Master Rep</label>
            <select
              v-model="form.masterRepId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              @change="loadDefaultStructure"
            >
              <option value="">Select Master Rep</option>
              <!-- TODO: Add rep options -->
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Commission %</label>
            <input
              type="number"
              v-model.number="form.masterRepPercentage"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              required
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        <!-- Sub Rep -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Sub Rep</label>
            <select
              v-model="form.subRepId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              @change="updateSubRepPercentage"
            >
              <option value="">None</option>
              <!-- TODO: Add rep options -->
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Commission %</label>
            <input
              type="number"
              v-model.number="form.subRepPercentage"
              :disabled="!form.subRepId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        <!-- Sub-Sub Rep -->
        <div class="grid grid-cols-2 gap-4">
          <div>
            <label class="block text-sm font-medium text-gray-700">Sub-Sub Rep</label>
            <select
              v-model="form.subSubRepId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              @change="updateSubSubRepPercentage"
            >
              <option value="">None</option>
              <!-- TODO: Add rep options -->
            </select>
          </div>
          <div>
            <label class="block text-sm font-medium text-gray-700">Commission %</label>
            <input
              type="number"
              v-model.number="form.subSubRepPercentage"
              :disabled="!form.subSubRepId"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
              min="0"
              max="100"
              step="0.01"
            />
          </div>
        </div>

        <!-- Validation Message -->
        <div v-if="validationError" class="text-sm text-red-600">
          {{ validationError }}
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <Button
            type="submit"
            :loading="updating"
            :disabled="!isValid || updating"
            severity="primary"
          >
            Update Commission Structure
          </Button>
        </div>
      </form>
    </div>

    <!-- Commission Breakdown Display -->
    <div class="bg-white rounded-lg shadow overflow-hidden">
      <div class="px-4 py-5 sm:px-6">
        <h3 class="text-lg font-medium leading-6 text-gray-900">Commission Breakdown</h3>
        <p class="mt-1 max-w-2xl text-sm text-gray-500">
          Total Commission: {{ formatCurrency(commissionBreakdown?.total_commission || 0) }}
        </p>
      </div>

      <div class="border-t border-gray-200">
        <dl>
          <template v-if="commissionBreakdown">
            <div
              v-for="commission in commissionBreakdown.commissions"
              :key="commission.rep_id"
              class="bg-gray-50 px-4 py-5 sm:grid sm:grid-cols-3 sm:gap-4 sm:px-6"
              :class="{ 'bg-white': commission.rep_type !== 'master' }"
            >
              <dt class="text-sm font-medium text-gray-500">
                {{ formatRepType(commission.rep_type) }}
              </dt>
              <dd class="mt-1 text-sm text-gray-900 sm:col-span-2 sm:mt-0">
                <div class="flex flex-col space-y-1">
                  <div class="flex justify-between items-center">
                    <span>{{ commission.rep_name }}</span>
                    <span class="font-medium text-green-600">
                      {{ formatCurrency(commission.commission_amount) }}
                    </span>
                  </div>
                  <div class="text-xs text-gray-500">
                    <span>Base Rate: {{ commission.base_rate }}%</span>
                    <span class="mx-2">|</span>
                    <span>Effective Rate: {{ commission.effective_rate }}%</span>
                  </div>
                </div>
              </dd>
            </div>
          </template>
          <div v-else class="px-4 py-5 text-sm text-gray-500 text-center">
            Loading commission breakdown...
          </div>
        </dl>
      </div>

      <!-- Last Modified Info -->
      <div v-if="commissionBreakdown?.updated_at" class="bg-gray-50 px-4 py-4 sm:px-6">
        <p class="text-sm text-gray-500">
          Last modified by {{ commissionBreakdown.updated_by }} on {{ formatDate(commissionBreakdown.updated_at) }}
        </p>
      </div>
    </div>

    <!-- Admin Commission Agreement Section -->
    <div v-if="isAdmin" class="bg-white rounded-lg shadow p-4">
      <h4 class="text-lg font-medium text-gray-900 mb-4">Update Commission Agreement</h4>
      
      <form @submit.prevent="handleAgreementUpdate" class="space-y-4">
        <!-- Sub Rep Selection -->
        <div>
          <label class="block text-sm font-medium text-gray-700">Sub Rep</label>
          <select
            v-model="form.subRepId"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
          >
            <option value="">Select Sub Rep</option>
            <option v-for="rep in availableSubReps" :key="rep.id" :value="rep.id">
              {{ rep.name }}
            </option>
          </select>
        </div>

        <!-- Commission Rate -->
        <div>
          <label class="block text-sm font-medium text-gray-700">
            Commission Rate (%)
            <span class="text-xs text-gray-500">
              (Will be deducted from Master Rep's {{ masterRepBaseRate }}%)
            </span>
          </label>
          <input
            type="number"
            v-model.number="form.commissionRate"
            class="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
            required
            min="0"
            :max="masterRepBaseRate"
            step="0.01"
          />
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <Button
            type="submit"
            :loading="updating"
            :disabled="!isValid || updating"
            severity="primary"
          >
            Update Agreement
          </Button>
        </div>
      </form>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { format } from 'date-fns'
import { useOrderStore } from '@/stores/orderStore'
import { useRepStore } from '@/stores/repStore'
import { useAuthStore } from '@/stores/authStore'
import type { OrderCommissionBreakdown, RepProfile } from '@/types/models'
import { Button } from '@/components/common/ui'

const props = defineProps<{
  orderId: number
}>()

const orderStore = useOrderStore()
const repStore = useRepStore()
const authStore = useAuthStore()

// State
const commissionBreakdown = ref<OrderCommissionBreakdown | null>(null)
const updating = ref(false)
const form = ref({
  masterRepId: '',
  masterRepPercentage: 100,
  subRepId: '',
  subRepPercentage: 0,
  subSubRepId: '',
  subSubRepPercentage: 0,
  commissionRate: 0
})

// Computed
const isAdmin = computed(() => authStore.isAdmin)
const masterRepBaseRate = computed(() => {
  const masterCommission = commissionBreakdown.value?.commissions.find(c => c.rep_type === 'master')
  return masterCommission?.base_rate || 0
})

const availableSubReps = computed(() => {
  return repStore.reps.filter(rep => 
    rep.rep_type === 'sub' && 
    rep.status === 'active' &&
    !commissionBreakdown.value?.commissions.some(c => c.rep_id === rep.id)
  )
})

const validationError = computed(() => {
  const total = form.value.masterRepPercentage +
    form.value.subRepPercentage +
    form.value.subSubRepPercentage

  if (Math.abs(total - 100) > 0.01) {
    return 'Commission percentages must total 100%'
  }

  return null
})

const isValid = computed(() => {
  return !validationError.value && 
    form.value.masterRepId && 
    (form.value.subRepId ? form.value.subRepPercentage > 0 : true) && 
    (form.value.subSubRepId ? form.value.subSubRepPercentage > 0 : true) && 
    (form.value.commissionRate > 0 && form.value.commissionRate <= masterRepBaseRate.value)
})

// Methods
async function loadCommissionBreakdown() {
  commissionBreakdown.value = await orderStore.calculateOrderCommission(props.orderId)
}

async function loadDefaultStructure() {
  if (!form.value.masterRepId) return

  const defaultStructure = await orderStore.fetchDefaultCommissionStructure(form.value.masterRepId)
  if (defaultStructure) {
    form.value.masterRepPercentage = defaultStructure.master_rep_percentage
    form.value.subRepPercentage = defaultStructure.sub_rep_percentage
    form.value.subSubRepPercentage = defaultStructure.sub_sub_rep_percentage
  }
}

function updateSubRepPercentage() {
  if (!form.value.subRepId) {
    form.value.subRepPercentage = 0
    form.value.masterRepPercentage = 100 - form.value.subSubRepPercentage
  }
}

function updateSubSubRepPercentage() {
  if (!form.value.subSubRepId) {
    form.value.subSubRepPercentage = 0
    form.value.masterRepPercentage = 100 - form.value.subRepPercentage
  }
}

async function handleCommissionUpdate() {
  if (!isValid.value) return

  updating.value = true
  try {
    const success = await orderStore.updateCommissionStructure(
      props.orderId,
      {
        masterRepId: form.value.masterRepId,
        masterRepPercentage: form.value.masterRepPercentage,
        subRepId: form.value.subRepId || undefined,
        subRepPercentage: form.value.subRepPercentage || undefined,
        subSubRepId: form.value.subSubRepId || undefined,
        subSubRepPercentage: form.value.subSubRepPercentage || undefined
      }
    )

    if (success) {
      await loadCommissionBreakdown()
    }
  } finally {
    updating.value = false
  }
}

async function handleAgreementUpdate() {
  if (!isValid.value) return

  updating.value = true
  try {
    const masterCommission = commissionBreakdown.value?.commissions.find(c => c.rep_type === 'master')
    if (!masterCommission) throw new Error('Master rep not found')

    await repStore.createCommissionAgreement(
      masterCommission.rep_id,
      form.value.subRepId,
      form.value.commissionRate
    )

    // Refresh commission breakdown
    await loadCommissionBreakdown()
    
    // Reset form
    form.value = {
      masterRepId: '',
      masterRepPercentage: 100,
      subRepId: '',
      subRepPercentage: 0,
      subSubRepId: '',
      subSubRepPercentage: 0,
      commissionRate: 0
    }
  } finally {
    updating.value = false
  }
}

function formatRepType(type: string): string {
  switch (type) {
    case 'master':
      return 'Master Rep'
    case 'sub':
      return 'Sub Rep'
    case 'sub-sub':
      return 'Sub-Sub Rep'
    default:
      return type
  }
}

function formatCurrency(value: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(value)
}

function formatDate(date: string): string {
  return format(new Date(date), 'MMM dd, yyyy HH:mm')
}

// Watchers
watch(() => props.orderId, loadCommissionBreakdown, { immediate: true })

// Lifecycle
onMounted(async () => {
  await Promise.all([
    repStore.fetchReps(),
    loadCommissionBreakdown()
  ])
})
</script>
