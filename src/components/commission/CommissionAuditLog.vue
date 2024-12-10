<template>
  <Layout
    title="Commission Audit Log"
    :loading="loading"
    :error="error"
  >
    <!-- Audit Log Table -->
    <Card>
      <Table
        :columns="columns"
        :items="auditLogs"
      >
        <template #date="{ item }">
          <span class="text-gray-300">{{ formatDate(item.changed_at) }}</span>
        </template>

        <template #changed_by="{ item }">
          <span class="text-gray-300">{{ item.changed_by }}</span>
        </template>

        <template #previous_rates="{ item }">
          <div class="space-y-1">
            <div class="text-sm text-gray-300">
              Master: <Badge severity="info">{{ item.previous_master_rate }}%</Badge>
            </div>
            <div v-if="item.previous_sub_rate" class="text-sm text-gray-300">
              Sub: <Badge severity="info">{{ item.previous_sub_rate }}%</Badge>
            </div>
            <div v-if="item.previous_sub_sub_rate" class="text-sm text-gray-300">
              Sub-Sub: <Badge severity="info">{{ item.previous_sub_sub_rate }}%</Badge>
            </div>
          </div>
        </template>

        <template #new_rates="{ item }">
          <div class="space-y-1">
            <div class="text-sm text-gray-300">
              Master: <Badge severity="success">{{ item.new_master_rate }}%</Badge>
            </div>
            <div v-if="item.new_sub_rate" class="text-sm text-gray-300">
              Sub: <Badge severity="success">{{ item.new_sub_rate }}%</Badge>
            </div>
            <div v-if="item.new_sub_sub_rate" class="text-sm text-gray-300">
              Sub-Sub: <Badge severity="success">{{ item.new_sub_sub_rate }}%</Badge>
            </div>
          </div>
        </template>

        <template #reason="{ item }">
          <span class="text-gray-300">{{ item.reason || '-' }}</span>
        </template>

        <template #empty>
          <EmptyState
            message="No changes have been made to this commission structure"
            icon="history"
          />
        </template>
      </Table>
    </Card>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabase } from '../../composables/useSupabase'
import type { CommissionAuditLog } from '../../types/models'
import { format } from 'date-fns'
import { Layout, Card, Badge, EmptyState, Table } from '../common/ui'

interface Props {
  structureId: string
}

const props = defineProps<Props>()
const supabase = useSupabase()

const auditLogs = ref<CommissionAuditLog[]>([])
const loading = ref(false)
const error = ref<string | null>(null)

// Table columns
const columns = [
  { field: 'date', header: 'Date' },
  { field: 'changed_by', header: 'Changed By' },
  { field: 'previous_rates', header: 'Previous Rates' },
  { field: 'new_rates', header: 'New Rates' },
  { field: 'reason', header: 'Reason' }
]

const loadAuditLog = async () => {
  if (!props.structureId) return
  
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

// Load initial data
onMounted(loadAuditLog)
</script>
