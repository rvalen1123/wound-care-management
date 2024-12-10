<template>
  <Layout
    title="Commission Approvals"
    subtitle="Review and manage pending commissions"
    :loading="loading"
    :error="error"
  >
    <!-- Pending Orders Table -->
    <Card>
      <template #header>
        <div class="flex justify-between items-center">
          <h3 class="text-lg leading-6 font-medium text-gray-200">
            Pending Orders
          </h3>
          <Badge severity="warning">
            {{ commissionStore.getPendingCommissions.length }} Pending
          </Badge>
        </div>
      </template>

      <Table
        :columns="columns"
        :items="commissionStore.getPendingCommissions"
        :pagination="true"
        :current-page="currentPage"
        :page-size="pageSize"
        :total-items="commissionStore.getPendingCommissions.length"
        @update:current-page="currentPage = $event"
      >
        <template #rep="{ item }">
          <div>
            <div class="text-sm font-medium text-gray-200">
              {{ item.master_rep?.name }}
            </div>
            <div v-if="item.sub_rep" class="text-sm text-gray-400">
              Sub: {{ item.sub_rep.name }}
            </div>
            <div v-if="item.sub_sub_rep" class="text-sm text-gray-400">
              Sub-Sub: {{ item.sub_sub_rep.name }}
            </div>
          </div>
        </template>

        <template #order_id="{ item }">
          <span class="text-gray-300">{{ item.order_id }}</span>
        </template>

        <template #base_amount="{ item }">
          <span class="text-gray-300">${{ formatCurrency(item.invoice_to_doc) }}</span>
        </template>

        <template #submitted="{ item }">
          <span class="text-gray-300">{{ formatDate(item.created_at) }}</span>
        </template>

        <template #actions="{ item }">
          <div class="flex space-x-3">
            <Button
              severity="success"
              label="Approve"
              @click="openApprovalModal(item)"
            />
            <Button
              severity="danger"
              label="Reject"
              @click="openRejectModal(item)"
            />
          </div>
        </template>
      </Table>
    </Card>

    <!-- Approval Modal -->
    <Modal
      v-model="showApprovalModal"
      title="Approve Commission"
      confirm-label="Approve"
      confirm-severity="success"
      @confirm="approveCommission"
    >
      <div class="space-y-4">
        <div>
          <label class="block text-sm font-medium text-gray-400">Base Amount</label>
          <p class="mt-1 text-lg font-medium text-gray-200">
            ${{ formatCurrency(selectedOrder?.invoice_to_doc || 0) }}
          </p>
        </div>

        <div>
          <label class="block text-sm font-medium text-gray-400">Commission Structure</label>
          <div class="mt-2 space-y-2">
            <!-- Master Rep -->
            <div v-if="selectedOrder?.master_rep" class="flex justify-between items-center">
              <span class="text-sm text-gray-300">{{ selectedOrder.master_rep.name }} (Master)</span>
              <span class="text-sm text-gray-400">${{ formatCurrency(getMasterCommission()) }}</span>
            </div>

            <!-- Sub Rep -->
            <div v-if="selectedOrder?.sub_rep" class="flex justify-between items-center">
              <span class="text-sm text-gray-300">{{ selectedOrder.sub_rep.name }} (Sub)</span>
              <span class="text-sm text-gray-400">${{ formatCurrency(getSubCommission()) }}</span>
            </div>

            <!-- Sub-Sub Rep -->
            <div v-if="selectedOrder?.sub_sub_rep" class="flex justify-between items-center">
              <span class="text-sm text-gray-300">{{ selectedOrder.sub_sub_rep.name }} (Sub-Sub)</span>
              <span class="text-sm text-gray-400">${{ formatCurrency(getSubSubCommission()) }}</span>
            </div>

            <div class="border-t border-gray-700 pt-2 mt-2">
              <div class="flex justify-between items-center font-medium">
                <span class="text-gray-200">Total Commission</span>
                <span class="text-gray-200">${{ formatCurrency(getTotalCommission()) }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </Modal>

    <!-- Reject Modal -->
    <Modal
      v-model="showRejectModal"
      title="Reject Commission"
      confirm-label="Reject"
      confirm-severity="danger"
      :confirm-disabled="!rejectNotes.trim()"
      @confirm="rejectCommission"
    >
      <FormInput
        v-model="rejectNotes"
        type="text"
        label="Reason for Rejection"
        :required="true"
        placeholder="Enter reason for rejection..."
        :error="!rejectNotes.trim() ? 'Reason is required' : ''"
      />
    </Modal>
  </Layout>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCommissionStore } from '../stores/commissionStore';
import type { Order } from '../types/models';
import { 
  Layout, 
  Card, 
  Badge, 
  Button, 
  Modal, 
  Table,
  FormInput 
} from '../components/common/ui';

const commissionStore = useCommissionStore();

// State
const loading = ref(false);
const error = ref<string | null>(null);
const currentPage = ref(1);
const pageSize = ref(10);

// Modal state
const showApprovalModal = ref(false);
const showRejectModal = ref(false);
const selectedOrder = ref<Order | null>(null);
const rejectNotes = ref('');

// Table columns
const columns = [
  { field: 'rep', header: 'Representatives' },
  { field: 'order_id', header: 'Order ID' },
  { field: 'base_amount', header: 'Base Amount' },
  { field: 'submitted', header: 'Submitted' },
  { field: 'actions', header: 'Actions' }
];

// Commission calculation methods
function getMasterCommission(): number {
  if (!selectedOrder.value?.invoice_to_doc) return 0;
  return selectedOrder.value.invoice_to_doc * 0.4; // 40% for master rep
}

function getSubCommission(): number {
  if (!selectedOrder.value?.invoice_to_doc || !selectedOrder.value?.sub_rep) return 0;
  return selectedOrder.value.invoice_to_doc * 0.2; // 20% for sub rep
}

function getSubSubCommission(): number {
  if (!selectedOrder.value?.invoice_to_doc || !selectedOrder.value?.sub_sub_rep) return 0;
  return selectedOrder.value.invoice_to_doc * 0.1; // 10% for sub-sub rep
}

function getTotalCommission(): number {
  return getMasterCommission() + getSubCommission() + getSubSubCommission();
}

// Methods
function openApprovalModal(order: Order) {
  selectedOrder.value = order;
  showApprovalModal.value = true;
}

function openRejectModal(order: Order) {
  selectedOrder.value = order;
  showRejectModal.value = true;
  rejectNotes.value = '';
}

async function approveCommission() {
  if (!selectedOrder.value?.order_id) return;

  loading.value = true;
  try {
    const commissionData = {
      total: getTotalCommission(),
      splits: [
        {
          rep_id: selectedOrder.value.master_rep_id,
          amount: getMasterCommission()
        }
      ]
    };

    if (selectedOrder.value.sub_rep_id) {
      commissionData.splits.push({
        rep_id: selectedOrder.value.sub_rep_id,
        amount: getSubCommission()
      });
    }

    if (selectedOrder.value.sub_sub_rep_id) {
      commissionData.splits.push({
        rep_id: selectedOrder.value.sub_sub_rep_id,
        amount: getSubSubCommission()
      });
    }

    await commissionStore.approveCommission(selectedOrder.value.order_id, commissionData);
    showApprovalModal.value = false;
    selectedOrder.value = null;
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

async function rejectCommission() {
  if (!selectedOrder.value?.order_id) return;

  loading.value = true;
  try {
    await commissionStore.rejectCommission(selectedOrder.value.order_id, rejectNotes.value);
    showRejectModal.value = false;
    selectedOrder.value = null;
    rejectNotes.value = '';
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
}

function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US').format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}

// Load initial data
onMounted(async () => {
  loading.value = true;
  try {
    await commissionStore.fetchPendingOrders();
  } catch (err: any) {
    error.value = err.message;
  } finally {
    loading.value = false;
  }
});
</script>
