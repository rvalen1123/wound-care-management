<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Commission Structure Management</h1>
      <Button 
        label="Add Commission Structure" 
        icon="pi pi-plus" 
        @click="openCommissionDialog()"
        class="p-button-primary"
      />
    </div>

    <!-- Commission Structures Table -->
    <DataTable 
      :value="commissionStructures"
      :paginator="true"
      :rows="10"
      :loading="loading"
      class="p-datatable-sm shadow-sm rounded-lg bg-white"
      responsiveLayout="scroll"
      stripedRows
      showGridlines
    >
      <Column field="manufacturer.name" header="Manufacturer" sortable>
        <template #body="{ data }">
          <span class="font-medium">{{ data.manufacturer?.name || '-' }}</span>
        </template>
      </Column>
      <Column field="master_rep.name" header="Master Rep" sortable>
        <template #body="{ data }">
          <span>{{ data.master_rep?.name || '-' }}</span>
        </template>
      </Column>
      <Column field="sub_rep.name" header="Sub Rep" sortable>
        <template #body="{ data }">
          <span>{{ data.sub_rep?.name || '-' }}</span>
        </template>
      </Column>
      <Column field="sub_sub_rep.name" header="Sub-Sub Rep" sortable>
        <template #body="{ data }">
          <span>{{ data.sub_sub_rep?.name || '-' }}</span>
        </template>
      </Column>
      
      <Column field="master_rep_rate" header="Master Rate" sortable>
        <template #body="{ data }">
          <span class="font-medium text-blue-600">{{ data.master_rep_rate }}%</span>
        </template>
      </Column>
      
      <Column field="sub_rep_rate" header="Sub Rate" sortable>
        <template #body="{ data }">
          <span class="font-medium text-green-600">{{ data.sub_rep_rate }}%</span>
        </template>
      </Column>
      
      <Column field="sub_sub_rep_rate" header="Sub-Sub Rate" sortable>
        <template #body="{ data }">
          <span class="font-medium text-purple-600">{{ data.sub_sub_rep_rate }}%</span>
        </template>
      </Column>

      <Column header="Actions" :exportable="false" style="min-width:8rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button 
              icon="pi pi-pencil" 
              class="p-button-text p-button-rounded p-button-info"
              @click="openCommissionDialog(data)" 
              tooltip="Edit"
            />
            <Button 
              icon="pi pi-history" 
              class="p-button-text p-button-rounded p-button-secondary"
              @click="viewAuditHistory(data)" 
              tooltip="View History"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Commission Structure Dialog -->
    <Dialog 
      v-model:visible="showCommissionDialog" 
      :header="dialogMode === 'add' ? 'Add Commission Structure' : 'Edit Commission Structure'"
      modal
      class="p-fluid w-full md:w-2/3 lg:w-1/2"
    >
      <div class="grid grid-cols-1 gap-4 p-4">
        <div class="field">
          <label class="font-medium mb-2 block text-gray-700">Manufacturer</label>
          <Dropdown
            v-model="editingStructure.manufacturer_id"
            :options="manufacturers"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Manufacturer"
            class="w-full"
            :class="{'p-invalid': !editingStructure.manufacturer_id}"
            required
          />
        </div>

        <div class="field">
          <label class="font-medium mb-2 block text-gray-700">Master Rep</label>
          <Dropdown
            v-model="editingStructure.master_rep_id"
            :options="masterReps"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Master Rep"
            class="w-full"
            :class="{'p-invalid': !editingStructure.master_rep_id}"
            required
          />
        </div>

        <div class="field">
          <label class="font-medium mb-2 block text-gray-700">Sub Rep (Optional)</label>
          <Dropdown
            v-model="editingStructure.sub_rep_id"
            :options="subReps"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Sub Rep"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="font-medium mb-2 block text-gray-700">Sub-Sub Rep (Optional)</label>
          <Dropdown
            v-model="editingStructure.sub_sub_rep_id"
            :options="subSubReps"
            optionLabel="name"
            optionValue="id"
            placeholder="Select Sub-Sub Rep"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="font-medium mb-2 block text-gray-700">Master Rep Rate (%)</label>
          <InputNumber 
            v-model="editingStructure.master_rep_rate"
            :min="0"
            :max="100"
            required
            @change="validateTotalRate"
            class="w-full"
            :class="{'p-invalid': !editingStructure.master_rep_rate}"
          />
        </div>

        <div class="field">
          <label class="font-medium mb-2 block text-gray-700">Sub Rep Rate (%)</label>
          <InputNumber 
            v-model="editingStructure.sub_rep_rate"
            :min="0"
            :max="100"
            @change="validateTotalRate"
            class="w-full"
          />
        </div>

        <div class="field">
          <label class="font-medium mb-2 block text-gray-700">Sub-Sub Rep Rate (%)</label>
          <InputNumber 
            v-model="editingStructure.sub_sub_rep_rate"
            :min="0"
            :max="100"
            @change="validateTotalRate"
            class="w-full"
          />
        </div>

        <div class="text-right text-sm font-medium" :class="{'text-red-600': !isValidTotal, 'text-green-600': isValidTotal}">
          Total Commission Rate: {{ totalRate }}%
        </div>
      </div>

      <template #footer>
        <div class="flex justify-end gap-2">
          <Button 
            label="Cancel" 
            icon="pi pi-times" 
            @click="showCommissionDialog = false" 
            class="p-button-text"
          />
          <Button 
            label="Save" 
            icon="pi pi-check" 
            @click="saveCommissionStructure" 
            :loading="saving"
            :disabled="!isValidTotal || !editingStructure.manufacturer_id || !editingStructure.master_rep_id"
            class="p-button-primary"
          />
        </div>
      </template>
    </Dialog>

    <!-- Audit History Dialog -->
    <Dialog 
      v-model:visible="showAuditDialog" 
      header="Commission Structure History"
      modal
      maximizable
      class="w-full md:w-3/4 lg:w-2/3"
    >
      <DataTable 
        :value="auditHistory" 
        class="p-datatable-sm"
        responsiveLayout="scroll"
        stripedRows
        showGridlines
      >
        <Column field="changed_at" header="Date" sortable>
          <template #body="{ data }">
            <span class="text-gray-600">{{ formatDate(data.changed_at) }}</span>
          </template>
        </Column>
        <Column field="changed_by_name" header="Changed By" sortable>
          <template #body="{ data }">
            <span class="text-gray-800">{{ data.changed_by_name }}</span>
          </template>
        </Column>
        <Column header="Previous Rates">
          <template #body="{ data }">
            <div class="space-y-1">
              <div class="text-blue-600">Master: {{ data.previous_master_rate }}%</div>
              <div class="text-green-600">Sub: {{ data.previous_sub_rate }}%</div>
              <div class="text-purple-600">Sub-Sub: {{ data.previous_sub_sub_rate }}%</div>
            </div>
          </template>
        </Column>
        <Column header="New Rates">
          <template #body="{ data }">
            <div class="space-y-1">
              <div class="text-blue-600">Master: {{ data.new_master_rate }}%</div>
              <div class="text-green-600">Sub: {{ data.new_sub_rate }}%</div>
              <div class="text-purple-600">Sub-Sub: {{ data.new_sub_sub_rate }}%</div>
            </div>
          </template>
        </Column>
        <Column field="reason" header="Reason">
          <template #body="{ data }">
            <span class="text-gray-700">{{ data.reason || '-' }}</span>
          </template>
        </Column>
      </DataTable>
    </Dialog>
  </div>
</template> 

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import Dropdown from 'primevue/dropdown'
import InputNumber from 'primevue/inputnumber'
import { useSupabase } from '@/composables/useSupabase'
import { useToast } from 'primevue/usetoast'
import type { CommissionStructure, Manufacturer, Representative, AuditLogEntry } from '@/types'

const supabase = useSupabase()
const toast = useToast()

// Dialog state
const showCommissionDialog = ref(false)
const showAuditDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const saving = ref(false)
const loading = ref(false)

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

// Load data
const loadCommissionStructures = async () => {
  loading.value = true
  try {
    const { data, error } = await supabase
      .from('commission_structures')
      .select(`
        *,
        manufacturer:manufacturers(id, name),
        master_rep:representatives(id, name),
        sub_rep:representatives(id, name),
        sub_sub_rep:representatives(id, name)
      `)
    
    if (error) throw error
    commissionStructures.value = data || []
  } catch (error) {
    console.error('Error loading commission structures:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load commission structures' })
  } finally {
    loading.value = false
  }
}

const loadManufacturers = async () => {
  try {
    const { data, error } = await supabase
      .from('manufacturers')
      .select('id, name, default_doctor_discount')
      .order('name')
    
    if (error) throw error
    manufacturers.value = (data || []).map(item => ({
      id: item.id,
      name: item.name,
      default_doctor_discount: item.default_doctor_discount || 0
    }))
  } catch (error) {
    console.error('Error loading manufacturers:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load manufacturers' })
  }
}

const loadRepresentatives = async () => {
  try {
    const { data, error } = await supabase
      .from('representatives')
      .select('id, name')
      .order('name')
    
    if (error) throw error
    masterReps.value = data || []
    subReps.value = data || []
    subSubReps.value = data || []
  } catch (error) {
    console.error('Error loading representatives:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load representatives' })
  }
}

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
    const { data, error } = await supabase
      .from('commission_structure_audit_log')
      .select(`
        *,
        changed_by_user:changed_by(email)
      `)
      .eq('commission_structure_id', structure.id)
      .order('changed_at', { ascending: false })
    
    if (error) throw error
    auditHistory.value = (data || []).map(item => ({
      ...item,
      changed_by_name: item.changed_by_user?.email || 'System'
    }))
    showAuditDialog.value = true
  } catch (error) {
    console.error('Error loading audit history:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to load audit history' })
  }
}

const saveCommissionStructure = async () => {
  if (!isValidTotal.value) return
  
  saving.value = true
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
      const { error } = await supabase
        .from('commission_structures')
        .insert([commissionData])
      if (error) throw error
    } else {
      const { error } = await supabase
        .from('commission_structures')
        .update(commissionData)
        .eq('id', editingStructure.value.id)
      if (error) throw error
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

    toast.add({ severity: 'success', summary: 'Success', detail: 'Commission structure saved successfully' })
    showCommissionDialog.value = false
    loadCommissionStructures() // Reload the list
  } catch (error) {
    console.error('Error saving commission structure:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save commission structure' })
  } finally {
    saving.value = false
  }
}

// Load initial data
onMounted(async () => {
  await loadCommissionStructures()
})
</script> 

<style>
/* Add any component styles here */
</style> 