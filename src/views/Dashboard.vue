<template>
  <div class="min-h-full bg-gray-50">
    <header class="bg-white shadow-sm">
      <div class="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8 flex items-center justify-between">
        <div class="flex items-center gap-8">
          <img class="h-8 w-auto" src="/msc-logo.png" alt="MSC Wound Care" />
          <nav class="flex space-x-8">
            <router-link v-for="item in navigation" :key="item.name" :to="item.href" 
              class="text-gray-700 hover:text-gray-900 px-3 py-2 text-sm font-medium">
              {{ item.name }}
            </router-link>
          </nav>
        </div>
        <div class="flex items-center gap-4">
          <button class="p-2 text-gray-500 hover:text-gray-700">
            <BellIcon class="h-6 w-6" />
          </button>
          <Menu as="div" class="relative">
            <MenuButton class="flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              <img class="h-8 w-8 rounded-full" :src="user.imageUrl || '/default-avatar.png'" :alt="user.name" />
            </MenuButton>
            <transition
              enter-active-class="transition ease-out duration-100"
              enter-from-class="transform opacity-0 scale-95"
              enter-to-class="transform opacity-100 scale-100"
              leave-active-class="transition ease-in duration-75"
              leave-from-class="transform opacity-100 scale-100"
              leave-to-class="transform opacity-0 scale-95"
            >
              <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <MenuItem v-for="item in userNavigation" :key="item.name" v-slot="{ active }">
                  <a :href="item.href" @click="item.action" :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']">
                    {{ item.name }}
                  </a>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
    </header>

    <main class="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
      <!-- Time period selector -->
      <div class="mb-8 flex items-center gap-4">
        <button v-for="period in ['Last 7 days', 'Last 30 days', 'All-time']" :key="period"
          :class="[
            'px-4 py-2 text-sm font-medium rounded-md',
            period === 'Last 7 days' ? 'bg-white text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300' : 'text-gray-500 hover:text-gray-900'
          ]">
          {{ period }}
        </button>
      </div>

      <!-- Stats grid -->
      <div class="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <div v-for="stat in stats" :key="stat.name" class="bg-white overflow-hidden rounded-lg p-6">
          <dt class="text-sm font-medium text-gray-500">{{ stat.name }}</dt>
          <dd class="mt-2 flex items-baseline justify-between">
            <div class="flex items-baseline text-2xl font-semibold text-gray-900">
              {{ stat.value }}
            </div>
            <div :class="[
              stat.changeType === 'positive' ? 'text-green-600' : 'text-red-600',
              'inline-flex items-baseline text-sm font-medium'
            ]">
              {{ stat.change }}
            </div>
          </dd>
        </div>
      </div>

      <!-- Recent Activity -->
      <div class="mt-8">
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h2 class="text-base font-semibold leading-6 text-gray-900">Recent activity</h2>
          </div>
          <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button label="New Invoice" severity="primary" icon="pi pi-plus" />
          </div>
        </div>

        <div class="mt-6 flow-root">
          <div class="-mx-4 -my-2 overflow-x-auto sm:-mx-6 lg:-mx-8">
            <div class="inline-block min-w-full py-2 align-middle sm:px-6 lg:px-8">
              <DataTable :value="recentTransactions" class="min-w-full divide-y divide-gray-300" stripedRows>
                <Column field="date" header="Date">
                  <template #body="{ data }">
                    <div class="whitespace-nowrap text-sm text-gray-500">{{ data.date }}</div>
                  </template>
                </Column>
                <Column field="amount" header="Amount">
                  <template #body="{ data }">
                    <div class="whitespace-nowrap text-sm font-medium text-gray-900">{{ data.amount }}</div>
                    <div class="whitespace-nowrap text-sm text-gray-500">{{ data.invoiceNumber }}</div>
                  </template>
                </Column>
                <Column field="description" header="Description">
                  <template #body="{ data }">
                    <div class="text-sm text-gray-900">{{ data.description }}</div>
                    <div class="text-sm text-gray-500">{{ data.client }}</div>
                  </template>
                </Column>
                <Column field="status" header="Status">
                  <template #body="{ data }">
                    <Tag :severity="data.status === 'Paid' ? 'success' : data.status === 'Pending' ? 'warning' : 'danger'"
                         :value="data.status"
                         class="text-xs" />
                  </template>
                </Column>
                <Column>
                  <template #body="{ data }">
                    <tr @click="viewTransaction(data)" class="cursor-pointer">
                      <Button label="View transaction" link />
                    </tr>
                  </template>
                </Column>
              </DataTable>
            </div>
          </div>
        </div>
      </div>

      <!-- Recent Clients -->
      <div class="mt-8">
        <div class="sm:flex sm:items-center">
          <div class="sm:flex-auto">
            <h2 class="text-base font-semibold leading-6 text-gray-900">Recent clients</h2>
          </div>
          <div class="mt-4 sm:ml-16 sm:mt-0 sm:flex-none">
            <Button label="View all" link />
          </div>
        </div>

        <div class="mt-6 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <div v-for="client in clients" :key="client.id" class="bg-white p-6 rounded-lg shadow-sm cursor-pointer" @click="viewClient(client)">
            <div class="flex items-center gap-4">
              <img class="h-12 w-12 rounded-lg bg-gray-100" :src="client.imageUrl" :alt="client.name" />
              <div>
                <h3 class="text-sm font-medium text-gray-900">{{ client.name }}</h3>
                <div class="mt-1 flex items-center gap-4">
                  <div class="text-sm text-gray-500">Last invoice</div>
                  <Tag :severity="client.lastInvoice.status === 'Paid' ? 'success' : client.lastInvoice.status === 'Pending' ? 'warning' : 'danger'"
                       :value="client.lastInvoice.status"
                       class="text-xs" />
                </div>
                <div class="mt-1 text-sm text-gray-900">{{ client.lastInvoice.amount }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  </div>
</template>

<script setup>
import { useRouter } from 'vue-router'
import { Menu, MenuButton, MenuItem } from '@headlessui/vue'
import { BellIcon } from '@heroicons/vue/24/outline'
import { useAuthStore } from '../stores/auth'

const router = useRouter()
const authStore = useAuthStore()

const navigation = [
  { name: 'Home', href: '/', current: true },
  { name: 'Invoices', href: '/invoices', current: false },
  { name: 'Clients', href: '/clients', current: false },
  { name: 'Expenses', href: '/expenses', current: false },
]

const stats = [
  { name: 'Revenue', value: '$405,091.00', change: '+4.75%', changeType: 'positive' },
  { name: 'Overdue invoices', value: '$12,787.00', change: '-54.02%', changeType: 'negative' },
  { name: 'Outstanding invoices', value: '$245,988.00', change: '-1.39%', changeType: 'negative' },
  { name: 'Expenses', value: '$30,156.00', change: '+10.18%', changeType: 'positive' },
]

const user = {
  name: 'John Doe',
  email: 'john@example.com',
  imageUrl: '/default-avatar.png'
}

const userNavigation = [
  { name: 'Your Profile', href: '/profile' },
  { name: 'Settings', href: '/settings' },
  { name: 'Sign out', href: '#', action: logout }
]

function logout() {
  authStore.logout()
  router.push('/login')
}

const recentTransactions = [
  {
    id: 1,
    date: 'Today',
    amount: '$7,600.00',
    invoiceNumber: '#00012',
    description: 'Website redesign',
    client: 'Reform',
    status: 'Paid'
  },
  {
    id: 2,
    amount: '$10,000.00',
    date: 'Today',
    invoiceNumber: '#00011',
    description: 'Salary',
    client: 'Tom Cook',
    status: 'Pending'
  },
  {
    id: 3,
    amount: '$2,000.00',
    date: 'Today',
    invoiceNumber: '#00009',
    description: 'Logo design',
    client: 'Tuple',
    status: 'Overdue'
  }
]

const clients = [
  {
    id: 1,
    name: 'Tuple',
    imageUrl: '/client-logo-1.png',
    lastInvoice: {
      date: 'December 13, 2022',
      amount: '$2,000.00',
      status: 'Overdue'
    }
  },
  {
    id: 2,
    name: 'SavvyCal',
    imageUrl: '/client-logo-2.png',
    lastInvoice: {
      date: 'January 22, 2023',
      amount: '$14,000.00',
      status: 'Paid'
    }
  },
  {
    id: 3,
    name: 'Reform',
    imageUrl: '/client-logo-3.png',
    lastInvoice: {
      date: 'January 23, 2023',
      amount: '$7,600.00',
      status: 'Paid'
    }
  }
]

function viewTransaction(transaction) {
  router.push(`/transactions/${transaction.id}`)
}

function viewClient(client) {
  router.push(`/clients/${client.id}`)
}
</script>
