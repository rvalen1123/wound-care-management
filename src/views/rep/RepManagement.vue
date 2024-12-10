<template>
  <div class="p-6">
    <div class="flex justify-between items-center mb-6">
      <h1 class="text-2xl font-bold">Sales Representatives Management</h1>
      <Button 
        label="Add Representative" 
        icon="pi pi-plus" 
        @click="openRepDialog()"
        severity="success"
      />
    </div>

    <!-- Rep List -->
    <DataTable 
      :value="reps" 
      :loading="loading"
      :paginator="true" 
      :rows="10"
      stripedRows
      class="p-datatable-sm"
    >
      <Column field="name" header="Name" sortable />
      <Column field="email" header="Email" sortable />
      <Column field="role" header="Role" sortable>
        <template #body="{ data }">
          <Tag :value="data.role" :severity="getRoleSeverity(data.role)" />
        </template>
      </Column>
      <Column field="parent.name" header="Reports To" sortable>
        <template #body="{ data }">
          {{ data.parent?.name || '-' }}
        </template>
      </Column>
      <Column field="commission_rate" header="Commission Rate" sortable>
        <template #body="{ data }">
          {{ data.commission_rate }}%
        </template>
      </Column>
      <Column field="status" header="Status" sortable>
        <template #body="{ data }">
          <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
        </template>
      </Column>
      <Column header="Actions">
        <template #body="{ data }">
          <div class="flex gap-2">
            <Button 
              icon="pi pi-pencil" 
              @click="openRepDialog(data)"
              severity="info"
              text
            />
            <Button 
              icon="pi pi-users" 
              @click="viewTeam(data)"
              severity="secondary"
              text
              v-if="data.role === 'master'"
            />
          </div>
        </template>
      </Column>
    </DataTable>

    <!-- Rep Dialog -->
    <Dialog 
      v-model:visible="showRepDialog" 
      :header="isEditing ? 'Edit Representative' : 'Add Representative'"
      modal
      class="p-fluid"
    >
      <div class="grid grid-cols-1 gap-4">
        <div class="field">
          <label>Name *</label>
          <InputText v-model="editingRep.name" :class="{ 'p-invalid': v$.name.$error }" />
          <small class="p-error" v-if="v$.name.$error">{{ v$.name.$errors[0].$message }}</small>
        </div>

        <div class="field">
          <label>Email *</label>
          <InputText v-model="editingRep.email" :class="{ 'p-invalid': v$.email.$error }" />
          <small class="p-error" v-if="v$.email.$error">{{ v$.email.$errors[0].$message }}</small>
        </div>

        <div class="field">
          <label>Role *</label>
          <Dropdown
            v-model="editingRep.role"
            :options="roleOptions"
            optionLabel="label"
            optionValue="value"
            :class="{ 'p-invalid': v$.role.$error }"
            @change="handleRoleChange"
          />
          <small class="p-error" v-if="v$.role.$error">{{ v$.role.$errors[0].$message }}</small>
        </div>

        <div class="field" v-if="editingRep.role !== 'master'">
          <label>Reports To *</label>
          <Dropdown
            v-model="editingRep.parent_id"
            :options="availableParentReps"
            optionLabel="name"
            optionValue="id"
            :class="{ 'p-invalid': v$.parent_id.$error }"
          />
          <small class="p-error" v-if="v$.parent_id.$error">{{ v$.parent_id.$errors[0].$message }}</small>
        </div>

        <div class="field">
          <label>Commission Rate *</label>
          <InputNumber
            v-model="editingRep.commission_rate"
            suffix="%"
            :min="0"
            :max="100"
            :class="{ 'p-invalid': v$.commission_rate.$error }"
          />
          <small class="p-error" v-if="v$.commission_rate.$error">{{ v$.commission_rate.$errors[0].$message }}</small>
        </div>

        <div class="field">
          <label>Status</label>
          <Dropdown
            v-model="editingRep.status"
            :options="statusOptions"
            optionLabel="label"
            optionValue="value"
          />
        </div>
      </div>

      <template #footer>
        <Button label="Cancel" @click="closeRepDialog" text />
        <Button 
          label="Save" 
          @click="saveRep" 
          severity="success"
          :loading="saving"
        />
      </template>
    </Dialog>

    <!-- Team View Dialog -->
    <Dialog 
      v-model:visible="showTeamDialog" 
      header="Team Structure"
      modal
      maximizable
    >
      <div v-if="selectedRep">
        <h3 class="text-lg font-medium mb-4">{{ selectedRep.name }}'s Team</h3>
        
        <!-- Sub Reps -->
        <div class="mb-6">
          <h4 class="text-md font-medium mb-2">Sub Representatives</h4>
          <DataTable :value="getSubReps(selectedRep.id)" class="p-datatable-sm">
            <Column field="name" header="Name" />
            <Column field="email" header="Email" />
            <Column field="commission_rate" header="Commission Rate">
              <template #body="{ data }">
                {{ data.commission_rate }}%
              </template>
            </Column>
            <Column field="status" header="Status">
              <template #body="{ data }">
                <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
              </template>
            </Column>
          </DataTable>
        </div>

        <!-- Sub-Sub Reps -->
        <div>
          <h4 class="text-md font-medium mb-2">Sub-Sub Representatives</h4>
          <DataTable :value="getSubSubReps(selectedRep.id)" class="p-datatable-sm">
            <Column field="name" header="Name" />
            <Column field="email" header="Email" />
            <Column field="parent.name" header="Reports To" />
            <Column field="commission_rate" header="Commission Rate">
              <template #body="{ data }">
                {{ data.commission_rate }}%
              </template>
            </Column>
            <Column field="status" header="Status">
              <template #body="{ data }">
                <Tag :value="data.status" :severity="getStatusSeverity(data.status)" />
              </template>
            </Column>
          </DataTable>
        </div>
      </div>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useVuelidate } from '@vuelidate/core';
import { required, email } from '@vuelidate/validators';
import { useRepStore } from '@/stores/repStore';
import type { Representative } from '@/types/models';
import DataTable from 'primevue/datatable';
import Column from 'primevue/column';
import Button from 'primevue/button';
import Dialog from 'primevue/dialog';
import InputText from 'primevue/inputtext';
import InputNumber from 'primevue/inputnumber';
import Dropdown from 'primevue/dropdown';
import Tag from 'primevue/tag';

interface RepData {
  id?: string;
  name: string;
  email: string;
  role: 'master' | 'sub' | 'sub-sub';
  parent_id: string | null;
  commission_rate: number;
  status: 'active' | 'inactive';
}

const repStore = useRepStore();

// State
const loading = ref(false);
const saving = ref(false);
const showRepDialog = ref(false);
const showTeamDialog = ref(false);
const isEditing = ref(false);
const selectedRep = ref<Representative | null>(null);

const editingRep = ref<RepData>({
  name: '',
  email: '',
  role: 'master',
  parent_id: null,
  commission_rate: 15,
  status: 'active'
});

// Options
const roleOptions = [
  { label: 'Master Rep', value: 'master' },
  { label: 'Sub Rep', value: 'sub' },
  { label: 'Sub-Sub Rep', value: 'sub-sub' }
];

const statusOptions = [
  { label: 'Active', value: 'active' },
  { label: 'Inactive', value: 'inactive' }
];

// Computed
const reps = computed(() => repStore.reps);

const availableParentReps = computed(() => {
  if (editingRep.value.role === 'sub') {
    return reps.value.filter((rep: Representative) => rep.role === 'master' && rep.status === 'active');
  } else if (editingRep.value.role === 'sub-sub') {
    return reps.value.filter((rep: Representative) => rep.role === 'sub' && rep.status === 'active');
  }
  return [];
});

// Validation rules
const rules = computed(() => ({
  name: { required },
  email: { required, email },
  role: { required },
  parent_id: {
    required: () => editingRep.value.role !== 'master'
  },
  commission_rate: { required }
}));

const v$ = useVuelidate(rules, editingRep);

// Methods
function getRoleSeverity(role: string): string {
  switch (role) {
    case 'master':
      return 'info';
    case 'sub':
      return 'success';
    case 'sub-sub':
      return 'warning';
    default:
      return 'info';
  }
}

function getStatusSeverity(status: string): string {
  return status === 'active' ? 'success' : 'danger';
}

function openRepDialog(rep?: Representative) {
  if (rep) {
    editingRep.value = {
      id: rep.id,
      name: rep.name,
      email: rep.email,
      role: rep.role,
      parent_id: rep.parent_id || null,
      commission_rate: rep.commission_rate,
      status: rep.status
    };
    isEditing.value = true;
  } else {
    editingRep.value = {
      name: '',
      email: '',
      role: 'master',
      parent_id: null,
      commission_rate: 15,
      status: 'active'
    };
    isEditing.value = false;
  }
  showRepDialog.value = true;
}

function closeRepDialog() {
  showRepDialog.value = false;
  v$.value.$reset();
}

function handleRoleChange() {
  editingRep.value.parent_id = null;
}

function viewTeam(rep: Representative) {
  selectedRep.value = rep;
  showTeamDialog.value = true;
}

function getSubReps(masterId: string) {
  return reps.value.filter((rep: Representative) => 
    rep.role === 'sub' && rep.parent_id === masterId
  );
}

function getSubSubReps(masterId: string) {
  const subReps = getSubReps(masterId);
  return reps.value.filter((rep: Representative) =>
    rep.role === 'sub-sub' && subReps.some((subRep: Representative) => subRep.id === rep.parent_id)
  );
}

async function saveRep() {
  try {
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    saving.value = true;
    if (isEditing.value && editingRep.value.id) {
      await repStore.updateRep(editingRep.value.id, editingRep.value);
    } else {
      await repStore.createRep(editingRep.value);
    }

    closeRepDialog();
    await repStore.fetchReps();
  } catch (error) {
    console.error('Error saving rep:', error);
  } finally {
    saving.value = false;
  }
}

// Load initial data
onMounted(async () => {
  loading.value = true;
  try {
    await repStore.fetchReps();
  } finally {
    loading.value = false;
  }
});
</script>
