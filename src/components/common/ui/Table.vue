<template>
  <div class="overflow-x-auto">
    <table class="min-w-full divide-y" :class="theme === 'dark' ? 'divide-gray-700' : 'divide-gray-200'">
      <thead :class="theme === 'dark' ? 'bg-gray-700' : 'bg-gray-50'">
        <tr>
          <th
            v-for="column in columns"
            :key="column.field"
            scope="col"
            class="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider"
            :class="theme === 'dark' ? 'text-gray-300' : 'text-gray-500'"
          >
            {{ column.header }}
          </th>
          <th v-if="$slots.actions" scope="col" class="relative px-6 py-3">
            <span class="sr-only">Actions</span>
          </th>
        </tr>
      </thead>
      <tbody
        :class="[
          theme === 'dark' ? 'divide-y divide-gray-700' : 'divide-y divide-gray-200',
          theme === 'dark' ? 'bg-gray-800' : 'bg-white'
        ]"
      >
        <tr
          v-for="(item, index) in items"
          :key="index"
          :class="[
            theme === 'dark' ? 'hover:bg-gray-750' : 'hover:bg-gray-50',
            theme === 'dark' ? 'text-gray-300' : 'text-gray-900'
          ]"
        >
          <td
            v-for="column in columns"
            :key="column.field"
            class="px-6 py-4 whitespace-nowrap text-sm"
          >
            <slot :name="column.field" :item="item" :value="getValue(item, column.field)">
              {{ getValue(item, column.field) }}
            </slot>
          </td>
          <td v-if="$slots.actions" class="px-6 py-4 whitespace-nowrap text-sm text-right">
            <slot name="actions" :item="item" />
          </td>
        </tr>
        <tr v-if="items.length === 0">
          <td :colspan="columns.length + ($slots.actions ? 1 : 0)">
            <slot name="empty">
              <EmptyState
                :theme="theme"
                icon="document"
                message="No data available"
              />
            </slot>
          </td>
        </tr>
      </tbody>
    </table>

    <!-- Pagination -->
    <div
      v-if="pagination"
      class="px-4 py-3 flex items-center justify-between border-t"
      :class="theme === 'dark' ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'"
    >
      <div class="flex-1 flex justify-between sm:hidden">
        <Button
          :disabled="currentPage === 1"
          @click="$emit('update:currentPage', currentPage - 1)"
          severity="secondary"
          size="small"
        >
          Previous
        </Button>
        <Button
          :disabled="currentPage === totalPages"
          @click="$emit('update:currentPage', currentPage + 1)"
          severity="secondary"
          size="small"
        >
          Next
        </Button>
      </div>
      <div class="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
        <div>
          <p class="text-sm" :class="theme === 'dark' ? 'text-gray-400' : 'text-gray-700'">
            Showing
            <span class="font-medium">{{ startIndex + 1 }}</span>
            to
            <span class="font-medium">{{ Math.min(endIndex, totalItems) }}</span>
            of
            <span class="font-medium">{{ totalItems }}</span>
            results
          </p>
        </div>
        <div>
          <nav class="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
            <Button
              v-for="page in displayedPages"
              :key="page"
              :severity="page === currentPage ? 'primary' : 'secondary'"
              :class="page === currentPage ? 'z-10' : ''"
              size="small"
              @click="$emit('update:currentPage', page)"
            >
              {{ page }}
            </Button>
          </nav>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue'
import { Button } from './index'
import EmptyState from './EmptyState.vue'

interface Column {
  field: string
  header: string
}

interface Props {
  columns: Column[]
  items: any[]
  theme?: 'light' | 'dark'
  pagination?: boolean
  currentPage?: number
  pageSize?: number
  totalItems?: number
}

const props = withDefaults(defineProps<Props>(), {
  theme: 'dark',
  pagination: false,
  currentPage: 1,
  pageSize: 10,
  totalItems: 0
})

defineEmits<{
  (e: 'update:currentPage', value: number): void
}>()

const getValue = (item: any, field: string) => {
  return field.split('.').reduce((obj, key) => obj?.[key], item)
}

// Pagination computeds
const totalPages = computed(() => Math.ceil(props.totalItems / props.pageSize))
const startIndex = computed(() => (props.currentPage - 1) * props.pageSize)
const endIndex = computed(() => startIndex.value + props.pageSize)

const displayedPages = computed(() => {
  const pages = []
  const maxPages = 5
  let start = Math.max(1, props.currentPage - Math.floor(maxPages / 2))
  let end = Math.min(totalPages.value, start + maxPages - 1)

  if (end - start + 1 < maxPages) {
    start = Math.max(1, end - maxPages + 1)
  }

  for (let i = start; i <= end; i++) {
    pages.push(i)
  }

  return pages
})
</script>

<style scoped>
.bg-gray-750 {
  background-color: rgba(55, 65, 81, 0.5);
}
</style>
