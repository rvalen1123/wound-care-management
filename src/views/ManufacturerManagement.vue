<template>
  <div class="container mx-auto px-4 py-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold text-gray-800">Manufacturer Management</h1>
      <Button 
        label="Add Manufacturer" 
        icon="pi pi-plus" 
        @click="openManufacturerDialog()"
        class="p-button-primary"
      />
    </div>

    <!-- Manufacturers Table -->
    <DataTable 
      :value="manufacturers" 
      :paginator="true" 
      :rows="10"
      class="p-datatable-sm shadow-sm rounded-lg bg-white"
      responsiveLayout="scroll"
      stripedRows
      showGridlines
    >
      <Column field="name" header="Name" sortable>
        <template #body="{ data }">
          <span class="font-medium">{{ data.name }}</span>
        </template>
      </Column>
      <Column field="default_doctor_discount" header="Default Doctor Discount" sortable>
        <template #body="{ data }">
          <span class="text-blue-600">{{ data.default_doctor_discount }}%</span>
        </template>
      </Column>
      <Column header="Actions" :exportable="false" style="min-width:8rem">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button 
              icon="pi pi-pencil" 
              class="p-button-text p-button-rounded p-button-info"
              @click="openManufacturerDialog(data)" 
              tooltip="Edit"
            />
            <Button 
              icon="pi pi-cog" 
              class="p-button-text p-button-rounded p-button-secondary"
              @click="openCommissionRatesDialog(data)" 
              tooltip="Commission Rates"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Manufacturer Dialog -->
    <Dialog 
      v-model:visible="showManufacturerDialog" 
      :header="dialogMode === 'add' ? 'Add Manufacturer' : 'Edit Manufacturer'"
      modal
      class="p-fluid w-full md:w-2/3 lg:w-1/2"
    >
      <div class="grid grid-cols-1 gap-4 p-4">
        <div class="field">
          <label for="name" class="font-medium mb-2 block text-gray-700">Name</label>
          <InputText 
            id="name" 
            v-model="editingManufacturer.name" 
            required 
            class="w-full"
          />
        </div>
        <div class="field">
          <label for="discount" class="font-medium mb-2 block text-gray-700">Default Doctor Discount (%)</label>
          <InputNumber 
            id="discount" 
            v-model="editingManufacturer.default_doctor_discount" 
            :min="0" 
            :max="100"
            class="w-full" 
          />
        </div>
      </div>
      <template #footer>
        <div class="flex justify-end gap-2">
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
            class="p-button-primary"
          />
        </div>
      </template>
    </Dialog>

    <!-- Commission Rates Dialog -->
    <Dialog 
      v-model:visible="showCommissionRatesDialog" 
      header="Commission Rates"
      modal
      maximizable
      class="w-full md:w-3/4 lg:w-2/3"
    >
      <div class="p-4">
        <DataTable 
          :value="commissionRates" 
          :paginator="true" 
          :rows="10"
          class="p-datatable-sm"
          responsiveLayout="scroll"
          stripedRows
          showGridlines
        >
          <Column field="user.name" header="Rep Name">
            <template #body="{ data }">
              <span class="font-medium">{{ data.user?.name || '-' }}</span>
            </template>
          </Column>
          <Column field="commission_rate" header="Commission Rate">
            <template #body="{ data }">
              <InputNumber 
                v-model="data.commission_rate" 
                suffix="%" 
                :min="0" 
                :max="100"
                @change="updateCommissionRate(data)"
                class="w-32" 
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