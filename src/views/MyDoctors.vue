<template>
  <div class="my-doctors">
    <vx-card>
      <template #header>
        <div class="d-flex justify-content-between align-items-center">
          <h1 class="h3 mb-0">My Doctors</h1>
          <vx-button @click="showNewDoctorRequest">
            Request New Doctor
          </vx-button>
        </div>
      </template>

      <vx-table
        :items="doctors"
        :fields="doctorFields"
        responsive
        hover
      >
        <template #cell(address)="{ item }">
          {{ formatAddress(item.address) }}
        </template>
        <template #cell(actions)="{ item }">
          <vx-button
            size="sm"
            variant="outline-primary"
            class="me-2"
            @click="viewOrders(item)"
          >
            View Orders
          </vx-button>
          <vx-button
            size="sm"
            variant="outline-secondary"
            @click="editDoctor(item)"
          >
            Edit
          </vx-button>
        </template>
      </vx-table>
    </vx-card>

    <!-- New Doctor Request Modal -->
    <vx-modal
      v-model="showRequestModal"
      title="Request New Doctor"
      size="lg"
    >
      <form @submit.prevent="submitDoctorRequest">
        <vx-input
          v-model="newRequest.doctorName"
          label="Doctor Name"
          required
          class="mb-3"
        />

        <vx-input
          v-model="newRequest.specialty"
          label="Specialty"
          required
          class="mb-3"
        />

        <vx-input
          v-model="newRequest.location"
          label="Location"
          required
          class="mb-3"
        />

        <vx-input
          v-model="newRequest.clinicFacility"
          label="Clinic/Facility"
          required
          class="mb-3"
        />

        <vx-checkbox
          v-model="newRequest.hasContacted"
          label="I have contacted this doctor"
          class="mb-3"
        />

        <vx-textarea
          v-model="newRequest.notes"
          label="Notes"
          rows="3"
          class="mb-3"
        />
      </form>

      <template #footer>
        <vx-button
          variant="secondary"
          @click="showRequestModal = false"
        >
          Cancel
        </vx-button>
        <vx-button
          variant="primary"
          @click="submitDoctorRequest"
          :loading="submitting"
        >
          Submit Request
        </vx-button>
      </template>
    </vx-modal>

    <!-- Edit Doctor Modal -->
    <vx-modal
      v-model="showEditModal"
      title="Edit Doctor"
      size="lg"
    >
      <form @submit.prevent="updateDoctor" v-if="selectedDoctor">
        <vx-input
          v-model="selectedDoctor.name"
          label="Doctor Name"
          required
          class="mb-3"
        />

        <vx-input
          v-model="selectedDoctor.businessName"
          label="Business Name"
          required
          class="mb-3"
        />

        <div class="row">
          <div class="col-12">
            <vx-input
              v-model="selectedDoctor.address.street"
              label="Street"
              required
              class="mb-3"
            />
          </div>
          <div class="col-12">
            <vx-input
              v-model="selectedDoctor.address.suite"
              label="Suite"
              class="mb-3"
            />
          </div>
          <div class="col-md-6">
            <vx-input
              v-model="selectedDoctor.address.city"
              label="City"
              required
              class="mb-3"
            />
          </div>
          <div class="col-md-3">
            <vx-input
              v-model="selectedDoctor.address.state"
              label="State"
              required
              maxlength="2"
              class="mb-3"
            />
          </div>
          <div class="col-md-3">
            <vx-input
              v-model="selectedDoctor.address.zipCode"
              label="ZIP Code"
              required
              class="mb-3"
            />
          </div>
        </div>

        <div class="row">
          <div class="col-md-6">
            <vx-input
              v-model="selectedDoctor.phone"
              label="Phone"
              required
              class="mb-3"
            />
          </div>
          <div class="col-md-6">
            <vx-input
              v-model="selectedDoctor.billerPhone"
              label="Biller Phone"
              required
              class="mb-3"
            />
          </div>
        </div>

        <vx-input
          v-model="selectedDoctor.billerName"
          label="Biller Name"
          required
          class="mb-3"
        />
      </form>

      <template #footer>
        <vx-button
          variant="secondary"
          @click="showEditModal = false"
        >
          Cancel
        </vx-button>
        <vx-button
          variant="primary"
          @click="updateDoctor"
          :loading="updating"
        >
          Save Changes
        </vx-button>
      </template>
    </vx-modal>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { Doctor } from '@/models/Doctor';
import { DoctorApprovalRequest } from '@/models/DoctorApprovalRequest';
import { supabase } from '@/config/supabase';

const router = useRouter();
const doctors = ref<Doctor[]>([]);
const showRequestModal = ref(false);
const showEditModal = ref(false);
const submitting = ref(false);
const updating = ref(false);
const selectedDoctor = ref<Doctor | null>(null);

const doctorFields = [
  { key: 'name', label: 'Doctor Name' },
  { key: 'businessName', label: 'Business Name' },
  { key: 'address', label: 'Address' },
  { key: 'phone', label: 'Phone' },
  { key: 'billerName', label: 'Biller Name' },
  { key: 'actions', label: '' }
];

const newRequest = ref<Partial<DoctorApprovalRequest>>({
  doctorName: '',
  specialty: '',
  location: '',
  clinicFacility: '',
  hasContacted: false,
  notes: ''
});

onMounted(fetchDoctors);

async function fetchDoctors() {
  try {
    const { data, error } = await supabase
      .from('doctors')
      .select('*')
      .eq('repId', localStorage.getItem('userId'));

    if (error) throw error;
    doctors.value = data;
  } catch (error) {
    console.error('Failed to fetch doctors:', error);
  }
}

function formatAddress(address: any) {
  return `${address.street}${address.suite ? ` ${address.suite}` : ''}, ${address.city}, ${address.state} ${address.zipCode}`;
}

function showNewDoctorRequest() {
  newRequest.value = {
    doctorName: '',
    specialty: '',
    location: '',
    clinicFacility: '',
    hasContacted: false,
    notes: ''
  };
  showRequestModal.value = true;
}

async function submitDoctorRequest() {
  try {
    submitting.value = true;
    const { error } = await supabase
      .from('doctor_approval_requests')
      .insert([newRequest.value]);

    if (error) throw error;

    showRequestModal.value = false;
    // Show success message
  } catch (error) {
    console.error('Failed to submit doctor request:', error);
    // Show error message
  } finally {
    submitting.value = false;
  }
}

function editDoctor(doctor: Doctor) {
  selectedDoctor.value = { ...doctor };
  showEditModal.value = true;
}

async function updateDoctor() {
  if (!selectedDoctor.value) return;

  try {
    updating.value = true;
    const { error } = await supabase
      .from('doctors')
      .update(selectedDoctor.value)
      .eq('id', selectedDoctor.value.id);

    if (error) throw error;

    showEditModal.value = false;
    await fetchDoctors();
    // Show success message
  } catch (error) {
    console.error('Failed to update doctor:', error);
    // Show error message
  } finally {
    updating.value = false;
  }
}

function viewOrders(doctor: Doctor) {
  router.push(`/my-orders?doctorId=${doctor.id}`);
}
</script>

<style lang="scss" scoped>
.my-doctors {
  .doctor-card {
    transition: transform 0.2s;
    &:hover {
      transform: translateY(-2px);
    }
  }
}
</style>
