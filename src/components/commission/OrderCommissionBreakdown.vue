<template>
  <div class="order-commission-breakdown">
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-semibold mb-4">Commission Breakdown</h3>
      
      <!-- Total Commission -->
      <div class="mb-6">
        <p class="text-sm text-gray-600">Total Rep Commission</p>
        <p class="text-2xl font-bold">${{ formatCurrency(totalCommission) }}</p>
      </div>

      <!-- Commission Distribution -->
      <div class="space-y-4">
        <!-- Master Rep -->
        <div v-if="masterRepCommission" class="flex justify-between items-center p-3 bg-gray-50 rounded">
          <div>
            <p class="font-medium">{{ masterRepName }}</p>
            <p class="text-sm text-gray-600">Master Rep ({{ masterRepRate }}%)</p>
          </div>
          <div class="text-right">
            <p class="font-medium">${{ formatCurrency(masterRepCommission) }}</p>
          </div>
        </div>

        <!-- Sub Rep -->
        <div v-if="subRepCommission" class="flex justify-between items-center p-3 bg-gray-50 rounded">
          <div>
            <p class="font-medium">{{ subRepName }}</p>
            <p class="text-sm text-gray-600">Sub Rep ({{ subRepRate }}%)</p>
          </div>
          <div class="text-right">
            <p class="font-medium">${{ formatCurrency(subRepCommission) }}</p>
          </div>
        </div>

        <!-- Sub-Sub Rep -->
        <div v-if="subSubRepCommission" class="flex justify-between items-center p-3 bg-gray-50 rounded">
          <div>
            <p class="font-medium">{{ subSubRepName }}</p>
            <p class="text-sm text-gray-600">Sub-Sub Rep ({{ subSubRepRate }}%)</p>
          </div>
          <div class="text-right">
            <p class="font-medium">${{ formatCurrency(subSubRepCommission) }}</p>
          </div>
        </div>
      </div>

      <!-- Commission Structure Selection -->
      <div v-if="isAdmin" class="mt-6">
        <label class="block text-sm font-medium text-gray-700 mb-2">
          Commission Structure
        </label>
        <select 
          v-model="selectedStructureId"
          class="block w-full rounded-md border-gray-300 shadow-sm"
          @change="applyCommissionStructure"
        >
          <option value="">Select a structure</option>
          <option 
            v-for="structure in availableStructures" 
            :key="structure.id" 
            :value="structure.id"
          >
            {{ structure.masterRepName }} 
            {{ structure.subRepName ? ` / ${structure.subRepName}` : '' }}
            {{ structure.subSubRepName ? ` / ${structure.subSubRepName}` : '' }}
            ({{ structure.masterRepRate }}% / {{ structure.subRepRate || 0 }}% / {{ structure.subSubRepRate || 0 }}%)
          </option>
        </select>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

interface CommissionStructure {
  id: string
  master_rep_id: string
  sub_rep_id?: string
  sub_sub_rep_id?: string
  master_rep_rate: number
  sub_rep_rate?: number
  sub_sub_rep_rate?: number
  master_rep?: { name: string }
  sub_rep?: { name: string }
  sub_sub_rep?: { name: string }
  masterRepName?: string
  subRepName?: string
  subSubRepName?: string
}

const supabase = useSupabase()

const props = defineProps<{
  orderId: string
  totalCommission: number
  masterRepId?: string
  subRepId?: string
  subSubRepId?: string
  masterRepRate?: number
  subRepRate?: number
  subSubRepRate?: number
  isAdmin: boolean
}>()

const emit = defineEmits<{
  (e: 'update:commission-structure', structure: {
    masterRepId: string
    subRepId?: string
    subSubRepId?: string
    masterRepRate: number
    subRepRate?: number
    subSubRepRate?: number
  }): void
}>()

// State
const selectedStructureId = ref('')
const availableStructures = ref<CommissionStructure[]>([])
const masterRepName = ref('')
const subRepName = ref('')
const subSubRepName = ref('')

// Computed values for commission amounts
const masterRepCommission = computed(() => {
  return props.totalCommission * (props.masterRepRate || 0) / 100
})

const subRepCommission = computed(() => {
  return props.totalCommission * (props.subRepRate || 0) / 100
})

const subSubRepCommission = computed(() => {
  return props.totalCommission * (props.subSubRepRate || 0) / 100
})

// Methods
const formatCurrency = (value: number) => {
  return value.toFixed(2)
}

const loadRepNames = async () => {
  if (props.masterRepId) {
    const { data } = await supabase
      .from('users')
      .select('name')
      .eq('id', props.masterRepId)
      .single()
    
    if (data) masterRepName.value = data.name
  }

  if (props.subRepId) {
    const { data } = await supabase
      .from('users')
      .select('name')
      .eq('id', props.subRepId)
      .single()
    
    if (data) subRepName.value = data.name
  }

  if (props.subSubRepId) {
    const { data } = await supabase
      .from('users')
      .select('name')
      .eq('id', props.subSubRepId)
      .single()
    
    if (data) subSubRepName.value = data.name
  }
}

const loadAvailableStructures = async () => {
  if (!props.masterRepId) return

  const { data, error } = await supabase
    .from('commission_structures')
    .select(`
      *,
      master_rep:master_rep_id(name),
      sub_rep:sub_rep_id(name),
      sub_sub_rep:sub_sub_rep_id(name)
    `)
    .eq('master_rep_id', props.masterRepId)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading commission structures:', error)
    return
  }

  availableStructures.value = (data || []).map((struct: CommissionStructure) => ({
    ...struct,
    masterRepName: struct.master_rep?.name,
    subRepName: struct.sub_rep?.name,
    subSubRepName: struct.sub_sub_rep?.name
  }))
}

const applyCommissionStructure = async () => {
  const structure = availableStructures.value.find(s => s.id === selectedStructureId.value)
  if (!structure) return

  emit('update:commission-structure', {
    masterRepId: structure.master_rep_id,
    subRepId: structure.sub_rep_id,
    subSubRepId: structure.sub_sub_rep_id,
    masterRepRate: structure.master_rep_rate,
    subRepRate: structure.sub_rep_rate,
    subSubRepRate: structure.sub_sub_rep_rate
  })
}

// Watchers
watch(() => props.masterRepId, async (newVal) => {
  if (newVal) {
    await Promise.all([
      loadRepNames(),
      loadAvailableStructures()
    ])
  }
})

// Lifecycle
onMounted(async () => {
  if (props.masterRepId) {
    await Promise.all([
      loadRepNames(),
      loadAvailableStructures()
    ])
  }
})
</script> 