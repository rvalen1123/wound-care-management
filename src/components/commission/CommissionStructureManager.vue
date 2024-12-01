<template>
  <div class="commission-structure-manager">
    <h2 class="text-2xl font-bold mb-4">Commission Structure Manager</h2>
    
    <!-- Commission Structure Form -->
    <div class="bg-white p-6 rounded-lg shadow-md">
      <form @submit.prevent="saveCommissionStructure">
        <!-- Rep Selection -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Master Rep</label>
            <select v-model="structure.masterRepId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option v-for="rep in masterReps" :key="rep.id" :value="rep.id">
                {{ rep.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Sub Rep</label>
            <select v-model="structure.subRepId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">None</option>
              <option v-for="rep in subReps" :key="rep.id" :value="rep.id">
                {{ rep.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Sub-Sub Rep</label>
            <select v-model="structure.subSubRepId" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">None</option>
              <option v-for="rep in subSubReps" :key="rep.id" :value="rep.id">
                {{ rep.name }}
              </option>
            </select>
          </div>
        </div>

        <!-- Commission Rates -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div>
            <label class="block text-sm font-medium text-gray-700">Master Rep Rate (%)</label>
            <input 
              type="number" 
              v-model.number="structure.masterRepRate"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              min="0"
              max="100"
              step="0.01"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Sub Rep Rate (%)</label>
            <input 
              type="number" 
              v-model.number="structure.subRepRate"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              min="0"
              max="100"
              step="0.01"
              :disabled="!structure.subRepId"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Sub-Sub Rep Rate (%)</label>
            <input 
              type="number" 
              v-model.number="structure.subSubRepRate"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              min="0"
              max="100"
              step="0.01"
              :disabled="!structure.subSubRepId"
            >
          </div>
        </div>

        <!-- Total Rate Display -->
        <div class="mb-6">
          <p class="text-sm font-medium" :class="{'text-red-600': totalRate > 100, 'text-green-600': totalRate <= 100}">
            Total Commission Rate: {{ totalRate }}%
          </p>
        </div>

        <!-- Submit Button -->
        <div class="flex justify-end">
          <button 
            type="submit"
            class="bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
            :disabled="!isValid"
          >
            Save Commission Structure
          </button>
        </div>
      </form>
    </div>

    <!-- Existing Structures Table -->
    <div class="mt-8">
      <h3 class="text-xl font-semibold mb-4">Existing Commission Structures</h3>
      <div class="overflow-x-auto">
        <table class="min-w-full bg-white rounded-lg shadow">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Master Rep</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub Rep</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sub-Sub Rep</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rates</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            <tr v-for="struct in existingStructures" :key="struct.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ struct.masterRepName }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ struct.subRepName || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ struct.subSubRepName || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ struct.masterRepRate }}% / {{ struct.subRepRate || 0 }}% / {{ struct.subSubRepRate || 0 }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button 
                  @click="editStructure(struct)"
                  class="text-blue-600 hover:text-blue-800 mr-2"
                >
                  Edit
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'

const supabase = useSupabase()

interface CommissionStructure {
  masterRepId: string
  subRepId: string | null
  subSubRepId: string | null
  masterRepRate: number
  subRepRate: number | null
  subSubRepRate: number | null
}

// State
const structure = ref<CommissionStructure>({
  masterRepId: '',
  subRepId: null,
  subSubRepId: null,
  masterRepRate: 100,
  subRepRate: null,
  subSubRepRate: null
})

const masterReps = ref([])
const subReps = ref([])
const subSubReps = ref([])
const existingStructures = ref([])

// Computed
const totalRate = computed(() => {
  return (structure.value.masterRepRate || 0) +
         (structure.value.subRepRate || 0) +
         (structure.value.subSubRepRate || 0)
})

const isValid = computed(() => {
  return structure.value.masterRepId &&
         structure.value.masterRepRate > 0 &&
         totalRate.value <= 100
})

// Methods
const loadReps = async () => {
  const { data: reps, error } = await supabase
    .from('users')
    .select('id, name, user_metadata->role as role')
    .eq('user_metadata->role', 'rep')

  if (error) {
    console.error('Error loading reps:', error)
    return
  }

  masterReps.value = reps
  subReps.value = reps
  subSubReps.value = reps
}

const loadExistingStructures = async () => {
  const { data, error } = await supabase
    .from('commission_structures')
    .select('*, master_rep:master_rep_id(name), sub_rep:sub_rep_id(name), sub_sub_rep:sub_sub_rep_id(name)')
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Error loading commission structures:', error)
    return
  }

  existingStructures.value = data.map(struct => ({
    ...struct,
    masterRepName: struct.master_rep?.name,
    subRepName: struct.sub_rep?.name,
    subSubRepName: struct.sub_sub_rep?.name
  }))
}

const saveCommissionStructure = async () => {
  const { error } = await supabase
    .from('commission_structures')
    .insert({
      master_rep_id: structure.value.masterRepId,
      sub_rep_id: structure.value.subRepId,
      sub_sub_rep_id: structure.value.subSubRepId,
      master_rep_rate: structure.value.masterRepRate,
      sub_rep_rate: structure.value.subRepRate,
      sub_sub_rep_rate: structure.value.subSubRepRate,
      created_by: supabase.auth.user()?.id
    })

  if (error) {
    console.error('Error saving commission structure:', error)
    return
  }

  // Reset form and reload structures
  structure.value = {
    masterRepId: '',
    subRepId: null,
    subSubRepId: null,
    masterRepRate: 100,
    subRepRate: null,
    subSubRepRate: null
  }
  
  await loadExistingStructures()
}

const editStructure = (struct: any) => {
  structure.value = {
    masterRepId: struct.master_rep_id,
    subRepId: struct.sub_rep_id,
    subSubRepId: struct.sub_sub_rep_id,
    masterRepRate: struct.master_rep_rate,
    subRepRate: struct.sub_rep_rate,
    subSubRepRate: struct.sub_sub_rep_rate
  }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadReps(),
    loadExistingStructures()
  ])
})
</script>