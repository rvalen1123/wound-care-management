<template>
  <Layout
    title="Commission Structure Management"
    :loading="loading"
    :error="error"
  >
    <template #actions>
      <Button
        label="Add Commission Structure"
        icon="pi pi-plus"
        severity="success"
        @click="openCommissionDialog()"
      />
    </template>

    <!-- Commission Structures Table -->
    <Card>
      <Table
        :columns="columns"
        :items="commissionStructures"
        :pagination="true"
        :current-page="currentPage"
        :page-size="pageSize"
        :total-items="commissionStructures.length"
        @update:current-page="currentPage = $event"
      >
        <template #manufacturer="{ item }">
          <span class="font-medium">{{ item.manufacturer?.name || '-' }}</span>
        </template>

        <template #master_rep="{ item }">
          <span>{{ item.master_rep?.name || '-' }}</span>
        </template>

        <template #sub_rep="{ item }">
          <span>{{ item.sub_rep?.name || '-' }}</span>
        </template>

        <template #sub_sub_rep="{ item }">
          <span>{{ item.sub_sub_rep?.name || '-' }}</span>
        </template>

        <template #master_rep_rate="{ item }">
          <Badge severity="info">{{ item.master_rep_rate }}%</Badge>
        </template>

        <template #sub_rep_rate="{ item }">
          <Badge severity="success">{{ item.sub_rep_rate }}%</Badge>
        </template>

        <template #sub_sub_rep_rate="{ item }">
          <Badge severity="warning">{{ item.sub_sub_rep_rate }}%</Badge>
        </template>

        <template #actions="{ item }">
          <div class="flex gap-2">
            <Button
              icon="pi pi-pencil"
              severity="info"
              @click="openCommissionDialog(item)"
              tooltip="Edit"
            />
            <Button
              icon="pi pi-history"
              severity="secondary"
              @click="viewAuditHistory(item)"
              tooltip="View History"
            />
          </div>
        </template>
      </Table>
    </Card>

    <!-- Commission Structure Dialog -->
    <Modal
      v-model="showCommissionDialog"
      :title="dialogMode === 'add' ? 'Add Commission Structure' : 'Edit Commission Structure'"
      confirm-label="Save"
      :confirm-disabled="!isValidTotal || !editingStructure.manufacturer_id || !editingStructure.master_rep_id"
      :loading="saving"
      @confirm="saveCommissionStructure"
    >
      <div class="grid grid-cols-1 gap-4">
        <FormDropdown
          v-model="editingStructure.manufacturer_id"
          :options="manufacturers"
          optionLabel="name"
          optionValue="id"
          label="Manufacturer"
          placeholder="Select Manufacturer"
          :required="true"
          :error="!editingStructure.manufacturer_id ? 'Manufacturer is required' : ''"
        />

        <FormDropdown
          v-model="editingStructure.master_rep_id"
          :options="masterReps"
          optionLabel="name"
          optionValue="id"
          label="Master Rep"
          placeholder="Select Master Rep"
          :required="true"
          :error="!editingStructure.master_rep_id ? 'Master Rep is required' : ''"
        />

        <FormDropdown
          v-model="editingStructure.sub_rep_id"
          :options="subReps"
          optionLabel="name"
          optionValue="id"
          label="Sub Rep (Optional)"
          placeholder="Select Sub Rep"
        />

        <FormDropdown
          v-model="editingStructure.sub_sub_rep_id"
          :options="subSubReps"
          optionLabel="name"
          optionValue="id"
          label="Sub-Sub Rep (Optional)"
          placeholder="Select Sub-Sub Rep"
        />

        <FormInput
          v-model="editingStructure.master_rep_rate"
          type="number"
          label="Master Rep Rate"
          :required="true"
          :min="0"
          :max="100"
          suffix="%"
          @input="validateTotalRate"
        />

        <FormInput
          v-model="editingStructure.sub_rep_rate"
          type="number"
          label="Sub Rep Rate"
          :min="0"
          :max="100"
          suffix="%"
          @input="validateTotalRate"
        />

        <FormInput
          v-model="editingStructure.sub_sub_rep_rate"
          type="number"
          label="Sub-Sub Rep Rate"
          :min="0"
          :max="100"
          suffix="%"
          @input="validateTotalRate"
        />

        <div class="text-right text-sm font-medium" :class="{'text-red-400': !isValidTotal, 'text-green-400': isValidTotal}">
          Total Commission Rate: {{ totalRate }}%
        </div>
      </div>
    </Modal>

    <!-- Audit History Dialog -->
    <Modal
      v-model="showAuditDialog"
      title="Commission Structure History"
    >
      <Table
        :columns="auditColumns"
        :items="auditHistory"
      >
        <template #changed_at="{ value }">
          <span class="text-gray-300">{{ formatDate(value) }}</span>
        </template>

        <template #changed_by_name="{ value }">
          <span class="text-gray-200">{{ value }}</span>
        </template>

        <template #previous_rates="{ item }">
          <div class="space-y-1">
            <div><Badge severity="info">Master: {{ item.previous_master_rate }}%</Badge></div>
            <div><Badge severity="success">Sub: {{ item.previous_sub_rate }}%</Badge></div>
            <div><Badge severity="warning">Sub-Sub: {{ item.previous_sub_sub_rate }}%</Badge></div>
          </div>
        </template>

        <template #new_rates="{ item }">
          <div class="space-y-1">
            <div><Badge severity="info">Master: {{ item.new_master_rate }}%</Badge></div>
            <div><Badge severity="success">Sub: {{ item.new_sub_rate }}%</Badge></div>
            <div><Badge severity="warning">Sub-Sub: {{ item.new_sub_sub_rate }}%</Badge></div>
          </div>
        </template>

        <template #reason="{ value }">
          <span class="text-gray-300">{{ value || '-' }}</span>
        </template>
      </Table>
    </Modal>
  </Layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import { useSupabase } from '../composables/useSupabase'
import type { CommissionStructure, Manufacturer, Representative, AuditLogEntry } from '../types/models'
import { 
  Layout, 
  Card, 
  Badge, 
  Button, 
  Modal, 
  Table, 
  FormDropdown, 
  FormInput 
} from '../components/common/ui'

const supabase = useSupabase()

// State
const loading = ref(false)
const error = ref<string | null>(null)
const saving = ref(false)
const currentPage = ref(1)
const pageSize = ref(10)

// Dialog state
const showCommissionDialog = ref(false)
const showAuditDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')

// Data
const commissionStructures = ref<CommissionStructure[]>([])
const editingStructure = ref<CommissionStructure>({
  manufacturer_id: null,
  master_rep_id: null,
  sub_rep_id: null,
  sub_sub_rep_id: null,
  master_rep_rate: 0,
  sub_rep_rate: 0,
  sub_sub_rep_rate: 0,
})

// Options for dropdowns
const manufacturers = ref<Manufacturer[]>([])
const masterReps = ref<Representative[]>([])
const subReps = ref<Representative[]>([])
const subSubReps = ref<Representative[]>([])
const auditHistory = ref<AuditLogEntry[]>([])

// Table columns
const columns = [
  { field: 'manufacturer', header: 'Manufacturer' },
  { field: 'master_rep', header: 'Master Rep' },
  { field: 'sub_rep', header: 'Sub Rep' },
  { field: 'sub_sub_rep', header: 'Sub-Sub Rep' },
  { field: 'master_rep_rate', header: 'Master Rate' },
  { field: 'sub_rep_rate', header: 'Sub Rate' },
  { field: 'sub_sub_rep_rate', header: 'Sub-Sub Rate' }
]

const auditColumns = [
  { field: 'changed_at', header: 'Date' },
  { field: 'changed_by_name', header: 'Changed By' },
  { field: 'previous_rates', header: 'Previous Rates' },
  { field: 'new_rates', header: 'New Rates' },
  { field: 'reason', header: 'Reason' }
]

// Computed
const totalRate = computed(() => {
  return (
    editingStructure.value.master_rep_rate +
    editingStructure.value.sub_rep_rate +
    editingStructure.value.sub_sub_rep_rate
  )
})

const isValidTotal = computed(() => totalRate.value <= 100)

// Methods
const validateTotalRate = () => {
  if (totalRate.value > 100) {
    editingStructure.value.sub_sub_rep_rate = Math.max(0, 100 - editingStructure.value.master_rep_rate - editingStructure.value.sub_rep_rate)
  }
}

const formatDate = (date: string) => {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  })
}

const loadCommissionStructures = async () => {
  loading.value = true
  error.value = null
  try {
    const { data, error: err } = await supabase
      .from('commission_structures')
      .select(`
        *,
        manufacturer:manufacturers(id, name),
        master_rep:representatives(id, name),
        sub_rep:representatives(id, name),
        sub_sub_rep:representatives(id, name)
      `)
    
    if (err) throw err
    commissionStructures.value = data || []
  } catch (err: any) {
    console.error('Error loading commission structures:', err)
    error.value = 'Failed to load commission structures'
  } finally {
    loading.value = false
  }
}

const loadManufacturers = async () => {
  try {
    const { data, error: err } = await supabase
      .from('manufacturers')
      .select('id, name, default_doctor_discount')
      .order('name')
    
    if (err) throw err
    manufacturers.value = data || []
  } catch (err: any) {
    console.error('Error loading manufacturers:', err)
    error.value = 'Failed to load manufacturers'
  }
}

const loadRepresentatives = async () => {
  try {
    const { data, error: err } = await supabase
      .from('representatives')
      .select('id, name')
      .order('name')
    
    if (err) throw err
    masterReps.value = data || []
    subReps.value = data || []
    subSubReps.value = data || []
  } catch (err: any) {
    console.error('Error loading representatives:', err)
    error.value = 'Failed to load representatives'
  }
}

const openCommissionDialog = async (data?: CommissionStructure) => {
  dialogMode.value = data ? 'edit' : 'add'
  if (data) {
    editingStructure.value = { ...data }
  } else {
    editingStructure.value = {
      manufacturer_id: null,
      master_rep_id: null,
      sub_rep_id: null,
      sub_sub_rep_id: null,
      master_rep_rate: 0,
      sub_rep_rate: 0,
      sub_sub_rep_rate: 0,
    }
  }
  
  // Load dropdown options if not already loaded
  if (manufacturers.value.length === 0) await loadManufacturers()
  if (masterReps.value.length === 0) await loadRepresentatives()
  
  showCommissionDialog.value = true
}

const viewAuditHistory = async (structure: CommissionStructure) => {
  try {
    const { data, error: err } = await supabase
      .from('commission_structure_audit_log')
      .select(`
        *,
        changed_by_user:changed_by(email)
      `)
      .eq('commission_structure_id', structure.id)
      .order('changed_at', { ascending: false })
    
    if (err) throw err
    auditHistory.value = (data || []).map(item => ({
      ...item,
      changed_by_name: item.changed_by_user?.email || 'System'
    }))
    showAuditDialog.value = true
  } catch (err: any) {
    console.error('Error loading audit history:', err)
    error.value = 'Failed to load audit history'
  }
}

const saveCommissionStructure = async () => {
  if (!isValidTotal.value) return
  
  saving.value = true
  error.value = null
  try {
    const { data: { session } } = await supabase.auth.getSession()
    const userId = session?.user?.id

    const commissionData = {
      manufacturer_id: editingStructure.value.manufacturer_id,
      master_rep_id: editingStructure.value.master_rep_id,
      sub_rep_id: editingStructure.value.sub_rep_id,
      sub_sub_rep_id: editingStructure.value.sub_sub_rep_id,
      master_rep_rate: editingStructure.value.master_rep_rate,
      sub_rep_rate: editingStructure.value.sub_rep_rate,
      sub_sub_rep_rate: editingStructure.value.sub_sub_rep_rate,
    }

    if (dialogMode.value === 'add') {
      const { error: err } = await supabase
        .from('commission_structures')
        .insert([commissionData])
      if (err) throw err
    } else {
      const { error: err } = await supabase
        .from('commission_structures')
        .update(commissionData)
        .eq('id', editingStructure.value.id)
      if (err) throw err
    }

    // Log the audit event
    await supabase.from('commission_structure_audit_log').insert([{
      commission_structure_id: editingStructure.value.id,
      action: dialogMode.value === 'add' ? 'insert' : 'update',
      changed_by: userId,
      previous_master_rate: dialogMode.value === 'add' ? 0 : editingStructure.value.master_rep_rate,
      previous_sub_rate: dialogMode.value === 'add' ? 0 : editingStructure.value.sub_rep_rate,
      previous_sub_sub_rate: dialogMode.value === 'add' ? 0 : editingStructure.value.sub_sub_rep_rate,
      new_master_rate: commissionData.master_rep_rate,
      new_sub_rate: commissionData.sub_rep_rate,
      new_sub_sub_rate: commissionData.sub_sub_rep_rate
    }])

    showCommissionDialog.value = false
    loadCommissionStructures() // Reload the list
  } catch (err: any) {
    console.error('Error saving commission structure:', err)
    error.value = 'Failed to save commission structure'
  } finally {
    saving.value = false
  }
}

// Load initial data
onMounted(async () => {
  await loadCommissionStructures()
})
</script>
