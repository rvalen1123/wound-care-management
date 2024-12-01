<template>
  <div class="commission-audit-log">
    <div class="bg-white p-6 rounded-lg shadow-md">
      <h3 class="text-lg font-semibold mb-4">Commission Structure Audit Log</h3>

      <!-- Loading State -->
      <div v-if="loading" class="flex justify-center items-center py-8">
        <div class="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>

      <!-- Error State -->
      <div v-else-if="error" class="text-red-600 py-4">
        {{ error }}
      </div>

      <!-- Audit Log Table -->
      <div v-else class="overflow-x-auto">
        <table class="min-w-full">
          <thead class="bg-gray-50">
            <tr>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Changed By</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Previous Rates</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">New Rates</th>
              <th class="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Reason</th>
            </tr>
          </thead>
          <tbody class="bg-white divide-y divide-gray-200">
            <tr v-for="entry in auditLog" :key="entry.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(entry.changed_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ entry.changed_by?.name }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="space-y-1">
                  <div>Master: {{ entry.previous_master_rate }}%</div>
                  <div v-if="entry.previous_sub_rate">Sub: {{ entry.previous_sub_rate }}%</div>
                  <div v-if="entry.previous_sub_sub_rate">Sub-Sub: {{ entry.previous_sub_sub_rate }}%</div>
                </div>
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                <div class="space-y-1">
                  <div>Master: {{ entry.new_master_rate }}%</div>
                  <div v-if="entry.new_sub_rate">Sub: {{ entry.new_sub_rate }}%</div>
                  <div v-if="entry.new_sub_sub_rate">Sub-Sub: {{ entry.new_sub_sub_rate }}%</div>
                </div>
              </td>
              <td class="px-6 py-4 text-sm text-gray-900">
                {{ entry.reason }}
              </td>
            </tr>
          </tbody>
        </table>

        <!-- Empty State -->
        <div v-if="auditLog.length === 0" class="text-center py-8 text-gray-500">
          No changes have been made to this commission structure.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, watch } from 'vue'
import { useCommission } from '@/composables/useCommission'

const props = defineProps<{
  structureId: string
}>()

// State
const { loading, error, getCommissionAuditLog } = useCommission()
const auditLog = ref([])

// Methods
const loadAuditLog = async () => {
  const data = await getCommissionAuditLog(props.structureId)
  auditLog.value = data
}

const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

// Watchers
watch(() => props.structureId, () => {
  if (props.structureId) {
    loadAuditLog()
  }
})

// Lifecycle
onMounted(() => {
  if (props.structureId) {
    loadAuditLog()
  }
})
</script> 