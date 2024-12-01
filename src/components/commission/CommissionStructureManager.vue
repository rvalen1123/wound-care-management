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
            <select v-model="structure.master_rep_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option v-for="rep in masterReps" :key="rep.id" :value="rep.id">
                {{ rep.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Sub Rep</label>
            <select v-model="structure.sub_rep_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
              <option value="">None</option>
              <option v-for="rep in subReps" :key="rep.id" :value="rep.id">
                {{ rep.name }}
              </option>
            </select>
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Sub-Sub Rep</label>
            <select v-model="structure.sub_sub_rep_id" class="mt-1 block w-full rounded-md border-gray-300 shadow-sm">
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
              v-model.number="structure.master_rep_rate"
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
              v-model.number="structure.sub_rep_rate"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              min="0"
              max="100"
              step="0.01"
              :disabled="!structure.sub_rep_id"
            >
          </div>
          
          <div>
            <label class="block text-sm font-medium text-gray-700">Sub-Sub Rep Rate (%)</label>
            <input 
              type="number" 
              v-model.number="structure.sub_sub_rep_rate"
              class="mt-1 block w-full rounded-md border-gray-300 shadow-sm"
              min="0"
              max="100"
              step="0.01"
              :disabled="!structure.sub_sub_rep_id"
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
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="struct in existingStructures" :key="struct.id">
              <td class="px-6 py-4 whitespace-nowrap">{{ struct.master_rep?.name || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ struct.sub_rep?.name || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">{{ struct.sub_sub_rep?.name || '-' }}</td>
              <td class="px-6 py-4 whitespace-nowrap">
                {{ struct.master_rep_rate }}% / {{ struct.sub_rep_rate || 0 }}% / {{ struct.sub_sub_rep_rate || 0 }}%
              </td>
              <td class="px-6 py-4 whitespace-nowrap">
                <button 
                  @click="editStructure(struct)"
                  class="text-blue-600 hover:text-blue-800"
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
import type { CommissionStructure } from '@/types/commission'

interface Representative {
  id: string;
  name: string;
}

const supabase = useSupabase()

// State
const structure = ref<CommissionStructure>({
  id: '',
  master_rep_id: '',
  sub_rep_id: '',
  sub_sub_rep_id: '',
  master_rep_rate: 0,
  sub_rep_rate: 0,
  sub_sub_rep_rate: 0,
  created_at: new Date().toISOString()
})

const masterReps = ref<Representative[]>([])
const subReps = ref<Representative[]>([])
const subSubReps = ref<Representative[]>([])
const existingStructures = ref<CommissionStructure[]>([])
const error = ref<string | null>(null)
const loading = ref(false)

// Computed
const totalRate = computed(() => {
  return (structure.value.master_rep_rate || 0) +
         (structure.value.sub_rep_rate || 0) +
         (structure.value.sub_sub_rep_rate || 0)
})

const isValid = computed(() => {
  return structure.value.master_rep_id &&
         structure.value.master_rep_rate > 0 &&
         totalRate.value <= 100
})

// Methods
const loadReps = async () => {
  try {
    const { data: reps, error: repsError } = await supabase
      .from('representatives')
      .select('id, name')
      .eq('role', 'rep')
    
    if (repsError) throw repsError
    
    masterReps.value = reps || []
    subReps.value = reps || []
    subSubReps.value = reps || []
  } catch (err: any) {
    error.value = err.message
  }
}

const loadExistingStructures = async () => {
  try {
    const { data: structures, error: structuresError } = await supabase
      .from('commission_structures')
      .select(`
        *,
        master_rep:representatives!master_rep_id(name),
        sub_rep:representatives!sub_rep_id(name),
        sub_sub_rep:representatives!sub_sub_rep_id(name)
      `)
      .order('created_at', { ascending: false })
    
    if (structuresError) throw structuresError
    
    existingStructures.value = structures || []
  } catch (err: any) {
    error.value = err.message
  }
}

const saveCommissionStructure = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { error: saveError } = await supabase
      .from('commission_structures')
      .upsert({
        ...structure.value,
        updated_at: new Date().toISOString()
      })
    
    if (saveError) throw saveError
    
    await loadExistingStructures()
    structure.value = {
      id: '',
      master_rep_id: '',
      sub_rep_id: '',
      sub_sub_rep_id: '',
      master_rep_rate: 0,
      sub_rep_rate: 0,
      sub_sub_rep_rate: 0,
      created_at: new Date().toISOString()
    }
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const editStructure = (struct: CommissionStructure) => {
  structure.value = { ...struct }
}

// Lifecycle
onMounted(async () => {
  await Promise.all([
    loadReps(),
    loadExistingStructures()
  ])
})
</script>