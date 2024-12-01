<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Manufacturer Management</h1>
      <Button 
        label="Add Manufacturer" 
        icon="pi pi-plus" 
        @click="openManufacturerDialog()"
      />
    </div>

    <!-- Manufacturers Table -->
    <DataTable 
      :value="manufacturers" 
      :paginator="true" 
      :rows="10"
      class="p-datatable-sm"
    >
      <Column field="name" header="Name" sortable />
      <Column field="default_doctor_discount" header="Default Doctor Discount" sortable>
        <template #body="{ data }">
          {{ data.default_doctor_discount }}%
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <Button 
            icon="pi pi-pencil" 
            class="p-button-text"
            @click="openManufacturerDialog(data)" 
          />
          <Button 
            icon="pi pi-cog" 
            class="p-button-text"
            @click="openCommissionRatesDialog(data)" 
          />
        </template>
      </Column>
    </DataTable>

    <!-- Manufacturer Dialog -->
    <Dialog 
      v-model:visible="showManufacturerDialog" 
      :header="dialogMode === 'add' ? 'Add Manufacturer' : 'Edit Manufacturer'"
      modal
    >
      <div class="p-fluid">
        <div class="field">
          <label for="name">Name</label>
          <InputText 
            id="name" 
            v-model="editingManufacturer.name" 
            required 
          />
        </div>
        <div class="field">
          <label for="discount">Default Doctor Discount (%)</label>
          <InputNumber 
            id="discount" 
            v-model="editingManufacturer.default_doctor_discount" 
            :min="0" 
            :max="100" 
          />
        </div>
      </div>
      <template #footer>
        <Button 
          label="Cancel" 
          icon="pi pi-times" 
          @click="showManufacturerDialog = false" 
          class="p-button-text"
        />
        <Button 
          label="Save" 
          icon="pi pi-check" 
          @click="saveManufacturer" 
          :loading="saving"
        />
      </template>
    </Dialog>

    <!-- Commission Rates Dialog -->
    <Dialog 
      v-model:visible="showCommissionRatesDialog" 
      header="Commission Rates"
      modal
      maximizable
    >
      <div class="p-fluid">
        <DataTable 
          :value="commissionRates" 
          :paginator="true" 
          :rows="10"
          class="p-datatable-sm"
        >
          <Column field="user.name" header="Rep Name" />
          <Column field="commission_rate" header="Commission Rate">
            <template #body="{ data }">
              <InputNumber 
                v-model="data.commission_rate" 
                suffix="%" 
                :min="0" 
                :max="100"
                @change="updateCommissionRate(data)" 
              />
            </template>
          </Column>
        </DataTable>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import { useSupabase } from '@/composables/useSupabase'
import type { Manufacturer, CommissionRate } from '@/types'
import Button from 'primevue/button'
import Column from 'primevue/column'
import DataTable from 'primevue/datatable'
import Dialog from 'primevue/dialog'
import InputText from 'primevue/inputtext'
import InputNumber from 'primevue/inputnumber'
import { useToast } from 'primevue/usetoast'

const supabase = useSupabase()
const toast = useToast()
const manufacturers = ref<Manufacturer[]>([])
const commissionRates = ref<CommissionRate[]>([])
const showManufacturerDialog = ref(false)
const showCommissionRatesDialog = ref(false)
const dialogMode = ref<'add' | 'edit'>('add')
const saving = ref(false)
const editingManufacturer = ref<Manufacturer>({
  name: '',
  default_doctor_discount: 40
})

onMounted(fetchManufacturers)

async function fetchManufacturers() {
  try {
    const { data, error } = await supabase
      .from('manufacturers')
      .select('id, name, default_doctor_discount')
      .order('name')

    if (error) throw error
    if (data) {
      manufacturers.value = data.map(item => ({
        id: item.id,
        name: item.name,
        default_doctor_discount: item.default_doctor_discount
      }))
    }
  } catch (error) {
    console.error('Error fetching manufacturers:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch manufacturers' })
  }
}

function openManufacturerDialog(manufacturer: Manufacturer | null = null) {
  dialogMode.value = manufacturer ? 'edit' : 'add'
  editingManufacturer.value = manufacturer 
    ? { ...manufacturer }
    : { name: '', default_doctor_discount: 40 }
  showManufacturerDialog.value = true
}

async function saveManufacturer() {
  try {
    saving.value = true
    const { error } = dialogMode.value === 'add'
      ? await supabase
          .from('manufacturers')
          .insert([editingManufacturer.value])
      : await supabase
          .from('manufacturers')
          .update(editingManufacturer.value)
          .eq('id', editingManufacturer.value.id)

    if (error) throw error
    
    await fetchManufacturers()
    showManufacturerDialog.value = false
    toast.add({ severity: 'success', summary: 'Success', detail: 'Manufacturer saved successfully' })
  } catch (error) {
    console.error('Error saving manufacturer:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to save manufacturer' })
  } finally {
    saving.value = false
  }
}

async function openCommissionRatesDialog(manufacturer: Manufacturer) {
  try {
    const { data, error } = await supabase
      .from('manufacturer_commission_rates')
      .select(`
        *,
        user:user_id (
          id,
          name
        )
      `)
      .eq('manufacturer_id', manufacturer.id)
    if (error) throw error
    commissionRates.value = data
    showCommissionRatesDialog.value = true
  } catch (error) {
    console.error('Error fetching commission rates:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to fetch commission rates' })
  }
}

async function updateCommissionRate(rate: CommissionRate) {
  try {
    const { error } = await supabase
      .from('manufacturer_commission_rates')
      .update({ commission_rate: rate.commission_rate })
      .eq('id', rate.id)

    if (error) throw error
    toast.add({ severity: 'success', summary: 'Success', detail: 'Commission rate updated' })
  } catch (error) {
    console.error('Error updating commission rate:', error)
    toast.add({ severity: 'error', summary: 'Error', detail: 'Failed to update commission rate' })
  }
}
</script> 