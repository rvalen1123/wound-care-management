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
            <tr v-for="entry in auditLogs" :key="entry.id">
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ formatDate(entry.changed_at) }}
              </td>
              <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                {{ entry.changed_by }}
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
        <div v-if="auditLogs.length === 0" class="text-center py-8 text-gray-500">
          No changes have been made to this commission structure.
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { CommissionAuditLog } from '@/types/commission'
import { format } from 'date-fns'

interface Props {
  structureId: string
}

const props = defineProps<Props>()
const supabase = useSupabase()

const auditLogs = ref<CommissionAuditLog[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

const loadAuditLog = async () => {
  loading.value = true
  error.value = null
  
  try {
    const { data, error: logError } = await supabase
      .from('commission_audit_logs')
      .select('*')
      .eq('structure_id', props.structureId)
      .order('changed_at', { ascending: false })
    
    if (logError) throw logError
    
    auditLogs.value = data || []
  } catch (err: any) {
    error.value = err.message
  } finally {
    loading.value = false
  }
}

const formatDate = (dateString: string): string => {
  try {
    return format(new Date(dateString), 'MMM d, yyyy h:mm a')
  } catch {
    return dateString
  }
}

// Watchers
watch(() => props.structureId, () => {
  if (props.structureId) {
    loadAuditLog()
  }
})

// Initial load
if (props.structureId) {
  loadAuditLog()
}
</script>