<template>
  <div class="min-h-screen bg-gray-900 py-8">
    <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <!-- Header -->
      <div class="mb-8">
        <h1 class="text-2xl font-bold text-white">Commission Approvals</h1>
        <p class="mt-2 text-sm text-gray-400">
          Review and manage pending commission structures
        </p>
      </div>

      <!-- Pending Reviews Table -->
      <div class="bg-gray-800 shadow rounded-lg overflow-hidden">
        <div class="px-4 py-5 sm:px-6 border-b border-gray-700 flex justify-between items-center">
          <h3 class="text-lg leading-6 font-medium text-white">
            Pending Reviews
          </h3>
          <span class="inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium bg-yellow-100 text-yellow-800">
            {{ commissionStore.pendingReviews.length }} Pending
          </span>
        </div>
        <div class="overflow-x-auto">
          <table class="min-w-full divide-y divide-gray-700">
            <thead class="bg-gray-700">
              <tr>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Rep
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Order ID
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Base Amount
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Submitted
                </th>
                <th scope="col" class="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody class="bg-gray-800 divide-y divide-gray-700">
              <tr v-for="review in commissionStore.pendingReviews" :key="review.id" class="hover:bg-gray-750">
                <td class="px-6 py-4 whitespace-nowrap">
                  <div class="flex items-center">
                    <div>
                      <div class="text-sm font-medium text-white">
                        {{ review.commission_structure?.rep?.name }}
                      </div>
                      <div class="text-sm text-gray-400">
                        {{ review.commission_structure?.rep?.email }}
                      </div>
                    </div>
                  </div>
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ review.commission_structure?.order_id }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ formatCurrency(review.commission_structure?.base_commission_amount || 0) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                  {{ formatDate(review.created_at) }}
                </td>
                <td class="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div class="flex space-x-3">
                    <button
                      @click="openApprovalModal(review)"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-green-600 hover:bg-green-500 focus:outline-none focus:border-green-700 focus:ring focus:ring-green-200 active:bg-green-700 transition ease-in-out duration-150"
                    >
                      Approve
                    </button>
                    <button
                      @click="openRejectModal(review)"
                      class="inline-flex items-center px-3 py-1 border border-transparent text-sm leading-5 font-medium rounded-md text-white bg-red-600 hover:bg-red-500 focus:outline-none focus:border-red-700 focus:ring focus:ring-red-200 active:bg-red-700 transition ease-in-out duration-150"
                    >
                      Reject
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="commissionStore.pendingReviews.length === 0">
                <td colspan="5" class="px-6 py-10 text-center text-gray-400">
                  No pending commission reviews
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>

    <!-- Approval Modal -->
    <div v-if="showApprovalModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-white">
                Approve Commission Structure
              </h3>
              <div class="mt-4">
                <p class="text-sm text-gray-400">
                  Are you sure you want to approve this commission structure? This action cannot be undone.
                </p>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              @click="approveCommission"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-green-600 text-base font-medium text-white hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 sm:col-start-2 sm:text-sm"
            >
              Approve
            </button>
            <button
              @click="showApprovalModal = false"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Reject Modal -->
    <div v-if="showRejectModal" class="fixed z-10 inset-0 overflow-y-auto">
      <div class="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div class="fixed inset-0 transition-opacity" aria-hidden="true">
          <div class="absolute inset-0 bg-gray-900 opacity-75"></div>
        </div>
        <div class="inline-block align-bottom bg-gray-800 rounded-lg px-4 pt-5 pb-4 text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full sm:p-6">
          <div>
            <div class="mt-3 text-center sm:mt-5">
              <h3 class="text-lg leading-6 font-medium text-white">
                Reject Commission Structure
              </h3>
              <div class="mt-4">
                <textarea
                  v-model="rejectNotes"
                  rows="3"
                  class="shadow-sm block w-full focus:ring-red-500 focus:border-red-500 sm:text-sm border border-gray-700 rounded-md bg-gray-700 text-white"
                  placeholder="Enter reason for rejection..."
                ></textarea>
              </div>
            </div>
          </div>
          <div class="mt-5 sm:mt-6 sm:grid sm:grid-cols-2 sm:gap-3 sm:grid-flow-row-dense">
            <button
              @click="rejectCommission"
              :disabled="!rejectNotes.trim()"
              class="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-red-600 text-base font-medium text-white hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 sm:col-start-2 sm:text-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Reject
            </button>
            <button
              @click="closeRejectModal"
              class="mt-3 w-full inline-flex justify-center rounded-md border border-gray-600 shadow-sm px-4 py-2 bg-gray-700 text-base font-medium text-gray-300 hover:bg-gray-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 sm:mt-0 sm:col-start-1 sm:text-sm"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useCommissionStore } from '../stores/commissionStore';
import type { PendingCommissionReview } from '../types/models';

const commissionStore = useCommissionStore();

// Modal state
const showApprovalModal = ref(false);
const showRejectModal = ref(false);
const selectedReview = ref<PendingCommissionReview | null>(null);
const rejectNotes = ref('');

onMounted(async () => {
  await commissionStore.fetchPendingReviews();
});

function openApprovalModal(review: PendingCommissionReview) {
  selectedReview.value = review;
  showApprovalModal.value = true;
}

function openRejectModal(review: PendingCommissionReview) {
  selectedReview.value = review;
  showRejectModal.value = true;
  rejectNotes.value = '';
}

function closeRejectModal() {
  showRejectModal.value = false;
  selectedReview.value = null;
  rejectNotes.value = '';
}

async function approveCommission() {
  if (selectedReview.value?.commission_structure?.id && selectedReview.value.id) {
    await commissionStore.approveCommissionStructure(
      selectedReview.value.commission_structure.id,
      selectedReview.value.id
    );
    showApprovalModal.value = false;
    selectedReview.value = null;
  }
}

async function rejectCommission() {
  if (selectedReview.value?.commission_structure?.id && selectedReview.value.id) {
    await commissionStore.rejectCommissionStructure(
      selectedReview.value.commission_structure.id,
      selectedReview.value.id,
      rejectNotes.value
    );
    closeRejectModal();
  }
}

// Utility functions
function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
}

function formatDate(dateString: string): string {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
}
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgba(55, 65, 81, 0.5);
}
</style>
