<template>
  <div class="p-4">
    <Card>
      <!-- Header -->
      <template #header>
        <div class="flex justify-between items-center">
          <h1 class="text-2xl font-semibold text-gray-800">
            {{ isEditing ? 'Edit Order' : 'New Order' }}
          </h1>
          <Button
            icon="pi pi-arrow-left"
            label="Back to Orders"
            text
            @click="router.push('/orders')"
          />
        </div>
      </template>

      <!-- Error Message -->
      <div v-if="formError" class="mb-4">
        <Message severity="error" :closable="true" @close="formError = null">
          {{ formError }}
        </Message>
      </div>

      <!-- Form -->
      <form @submit.prevent="handleSubmit" class="space-y-6">
        <!-- Doctor and Product Selection -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Doctor *</label>
            <Dropdown
              v-model="formData.doctor_id"
              :options="doctors"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Doctor"
              :class="{ 'p-invalid': v$.doctor_id.$error }"
              class="w-full"
              :disabled="loading"
            />
            <small class="text-red-500" v-if="v$.doctor_id.$error">
              {{ v$.doctor_id.$errors[0].$message }}
            </small>
          </div>

          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Product *</label>
            <Dropdown
              v-model="formData.product_id"
              :options="products"
              optionLabel="name"
              optionValue="id"
              placeholder="Select Product"
              :class="{ 'p-invalid': v$.product_id.$error }"
              class="w-full"
              :disabled="loading"
              @change="handleProductChange"
            />
            <small class="text-red-500" v-if="v$.product_id.$error">
              {{ v$.product_id.$errors[0].$message }}
            </small>
          </div>
        </div>

        <!-- Service Date and Size -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Date of Service *</label>
            <Calendar
              v-model="formData.date_of_service"
              :showIcon="true"
              :maxDate="new Date()"
              dateFormat="yy-mm-dd"
              :class="{ 'p-invalid': v$.date_of_service.$error }"
              class="w-full"
              :disabled="loading"
            />
            <small class="text-red-500" v-if="v$.date_of_service.$error">
              {{ v$.date_of_service.$errors[0].$message }}
            </small>
          </div>

          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Size *</label>
            <Dropdown
              v-model="formData.size"
              :options="selectedProduct?.sizes || []"
              placeholder="Select Size"
              :class="{ 'p-invalid': v$.size.$error }"
              class="w-full"
              :disabled="!selectedProduct || loading"
              @change="handleSizeChange"
            />
            <small class="text-red-500" v-if="v$.size.$error">
              {{ v$.size.$errors[0].$message }}
            </small>
          </div>
        </div>

        <!-- Units and Invoice Amount -->
        <div class="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Units *</label>
            <InputNumber
              v-model="formData.units"
              :minFractionDigits="2"
              :maxFractionDigits="2"
              :class="{ 'p-invalid': v$.units.$error }"
              class="w-full"
              :disabled="!selectedProduct || loading"
              @input="handleUnitsChange"
            />
            <small class="text-red-500" v-if="v$.units.$error">
              {{ v$.units.$errors[0].$message }}
            </small>
          </div>

          <div class="flex flex-col">
            <label class="mb-1 text-sm text-gray-600">Invoice Amount</label>
            <InputNumber
              v-model="formData.invoice_to_doc"
              mode="currency"
              currency="USD"
              :minFractionDigits="2"
              class="w-full"
              disabled
            />
            <small class="text-gray-500">
              Automatically calculated based on product ASP
            </small>
          </div>
        </div>

        <!-- Rep Assignment -->
        <div class="bg-gray-50 p-4 rounded-lg">
          <h3 class="text-lg font-medium text-gray-700 mb-4">Rep Assignment</h3>
          <div class="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div class="flex flex-col">
              <label class="mb-1 text-sm text-gray-600">Master Rep *</label>
              <Dropdown
                v-model="formData.master_rep_id"
                :options="masterReps"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Master Rep"
                :class="{ 'p-invalid': v$.master_rep_id.$error }"
                class="w-full"
                :disabled="loading"
                @change="handleMasterRepChange"
              />
              <small class="text-red-500" v-if="v$.master_rep_id.$error">
                {{ v$.master_rep_id.$errors[0].$message }}
              </small>
            </div>

            <div class="flex flex-col">
              <label class="mb-1 text-sm text-gray-600">Sub Rep</label>
              <Dropdown
                v-model="formData.sub_rep_id"
                :options="subReps"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Sub Rep"
                class="w-full"
                :disabled="!formData.master_rep_id || loading"
                @change="handleSubRepChange"
              />
            </div>

            <div class="flex flex-col">
              <label class="mb-1 text-sm text-gray-600">Sub-Sub Rep</label>
              <Dropdown
                v-model="formData.sub_sub_rep_id"
                :options="subSubReps"
                optionLabel="name"
                optionValue="id"
                placeholder="Select Sub-Sub Rep"
                class="w-full"
                :disabled="!formData.sub_rep_id || loading"
              />
            </div>
          </div>
        </div>

        <!-- Commission Information -->
        <OrderCommissionBreakdown
          v-if="formData.msc_commission > 0"
          :commission-amount="formData.msc_commission"
          :master-rep-id="formData.master_rep_id"
          :sub-rep-id="formData.sub_rep_id"
          :sub-sub-rep-id="formData.sub_sub_rep_id"
          :master-rep="selectedMasterRep"
          :sub-rep="selectedSubRep"
          :sub-sub-rep="selectedSubSubRep"
          ref="commissionBreakdown"
        />

        <!-- Form Actions -->
        <div class="flex justify-end space-x-4 pt-6">
          <Button
            type="button"
            label="Cancel"
            severity="secondary"
            text
            @click="router.back()"
            :disabled="loading"
          />
          <Button
            type="submit"
            :label="isEditing ? 'Update Order' : 'Create Order'"
            :loading="loading"
            severity="success"
            :disabled="!isValid || loading"
          />
        </div>
      </form>
    </Card>

    <!-- Success Toast -->
    <Toast position="bottom-right" />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required, minValue } from '@vuelidate/validators';
import { useOrderStore } from '@/stores/orderStore';
import { useDoctorStore } from '@/stores/doctorStore';
import { useProductStore } from '@/stores/productStore';
import { useRepStore } from '@/stores/repStore';
import { commissionService } from '@/services/commission.service';
import type { Order, Product, Representative } from '@/types/models';
import OrderCommissionBreakdown from '@/components/commission/OrderCommissionBreakdown.vue';
import { Card, Button, Dropdown, Calendar, InputNumber, Message, Toast } from 'primevue/components';
import { useToast } from 'primevue/usetoast';

const router = useRouter();
const route = useRoute();
const toast = useToast();
const orderStore = useOrderStore();
const doctorStore = useDoctorStore();
const productStore = useProductStore();
const repStore = useRepStore();

// State
const loading = ref(false);
const formError = ref<string | null>(null);
const selectedProduct = ref<Product | null>(null);
const commissionBreakdown = ref<InstanceType<typeof OrderCommissionBreakdown> | null>(null);

const formData = ref<Partial<Order>>({
  doctor_id: '',
  product_id: '',
  date_of_service: null,
  size: '',
  units: 0,
  invoice_to_doc: 0,
  msc_commission: 0,
  expected_collection_date: null,
  status: 'pending',
  master_rep_id: '',
  sub_rep_id: null,
  sub_sub_rep_id: null,
  commission_structure: {
    master: 0,
    sub: 0,
    subSub: 0
  }
});

// Computed
const isEditing = computed(() => !!route.params.id);
const doctors = computed(() => doctorStore.doctors);
const products = computed(() => productStore.products);
const masterReps = computed(() => repStore.getRepsByRole('master'));
const subReps = computed(() =>
  formData.value.master_rep_id
    ? repStore.getSubReps(formData.value.master_rep_id)
    : []
);
const subSubReps = computed(() =>
  formData.value.sub_rep_id
    ? repStore.getSubSubReps(formData.value.sub_rep_id)
    : []
);

const selectedMasterRep = computed((): Representative | undefined => 
  masterReps.value.find((rep: Representative) => rep.id === formData.value.master_rep_id)
);

const selectedSubRep = computed((): Representative | undefined => 
  subReps.value.find((rep: Representative) => rep.id === formData.value.sub_rep_id)
);

const selectedSubSubRep = computed((): Representative | undefined => 
  subSubReps.value.find((rep: Representative) => rep.id === formData.value.sub_sub_rep_id)
);

// Validation rules
const rules = {
  doctor_id: { required },
  product_id: { required },
  date_of_service: { required },
  size: { required },
  units: { required, minValue: minValue(0) },
  master_rep_id: { required }
};

const v$ = useVuelidate(rules, formData);

const isValid = computed(() => {
  return !v$.$invalid && formData.value.units > 0;
});

// Methods
async function handleSubmit() {
  formError.value = null;
  
  try {
    loading.value = true;
    const isValid = await v$.value.$validate();
    if (!isValid) return;

    // Get commission structure from breakdown component
    const commissionStructure = commissionBreakdown.value?.getCommissionStructure();
    if (!commissionStructure) {
      throw new Error('Failed to calculate commission structure');
    }

    const orderData = {
      ...formData.value,
      commission_structure: commissionStructure
    };

    if (isEditing.value) {
      await orderStore.updateOrder(route.params.id as string, orderData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Order updated successfully',
        life: 3000
      });
    } else {
      await orderStore.createOrder(orderData);
      toast.add({
        severity: 'success',
        summary: 'Success',
        detail: 'Order created successfully',
        life: 3000
      });
    }
    
    router.push('/orders');
  } catch (error) {
    formError.value = error instanceof Error ? error.message : 'An error occurred while saving the order';
    toast.add({
      severity: 'error',
      summary: 'Error',
      detail: formError.value,
      life: 5000
    });
  } finally {
    loading.value = false;
  }
}

function handleProductChange() {
  if (!formData.value.product_id) return;

  selectedProduct.value =
    products.value.find(
      (p: Product) => p.id === formData.value.product_id
    ) || null;

  // Reset dependent fields
  formData.value.size = '';
  formData.value.units = 0;
  calculateOrderValues();
}

function handleSizeChange() {
  calculateOrderValues();
}

function handleUnitsChange() {
  calculateOrderValues();
}

function handleMasterRepChange() {
  // Reset dependent fields
  formData.value.sub_rep_id = null;
  formData.value.sub_sub_rep_id = null;
  calculateOrderValues();
}

function handleSubRepChange() {
  formData.value.sub_sub_rep_id = null;
  calculateOrderValues();
}

function calculateOrderValues() {
  if (!selectedProduct.value || !formData.value.units) return;

  const calculations = orderStore.calculateOrderValues({
    product: selectedProduct.value,
    units: formData.value.units
  });

  formData.value.invoice_to_doc = calculations.invoiceAmount;
  formData.value.msc_commission = calculations.mscCommission;
  formData.value.expected_collection_date = calculations.expectedCollectionDate;

  // Update commission structure
  if (formData.value.master_rep_id) {
    const commissionStructure = commissionService.calculateCommissionStructure(
      calculations.invoiceAmount,
      formData.value.master_rep_id,
      formData.value.sub_rep_id,
      formData.value.sub_sub_rep_id
    );
    formData.value.commission_structure = commissionStructure;
  }
}

// Lifecycle
onMounted(async () => {
  try {
    loading.value = true;
    formError.value = null;

    await Promise.all([
      doctorStore.fetchDoctors(),
      productStore.fetchProducts(),
      repStore.fetchReps()
    ]);

    if (isEditing.value) {
      const order = await orderStore.getOrderById(route.params.id as string);
      if (order) {
        formData.value = { ...order };
        selectedProduct.value =
          products.value.find((p: Product) => p.id === order.product_id) || null;
      } else {
        formError.value = 'Order not found';
      }
    }
  } catch (error) {
    formError.value = 'Failed to load form data';
    console.error('Form initialization error:', error);
  } finally {
    loading.value = false;
  }
});
</script>
