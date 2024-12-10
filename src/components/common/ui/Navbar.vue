<template>
  <nav class="bg-white shadow">
    <div class="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div class="flex h-16 justify-between">
        <!-- Logo and Main Nav -->
        <div class="flex">
          <div class="flex shrink-0 items-center">
            <img class="h-8 w-auto" src="/msc-logo.png" alt="MSC Medical" />
          </div>
          <div class="hidden md:ml-6 md:flex md:space-x-4">
            <!-- Common Navigation -->
            <router-link 
              to="/dashboard" 
              class="inline-flex items-center px-1 pt-1 text-sm font-medium"
              :class="[route.path === '/dashboard' ? 'border-indigo-500 text-gray-900 border-b-2' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']"
            >
              Dashboard
            </router-link>

            <!-- Orders Dropdown -->
            <Menu as="div" class="relative">
              <MenuButton 
                class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
              >
                Orders
                <ChevronDownIcon class="ml-1 h-4 w-4" />
              </MenuButton>
              <transition
                enter-active-class="transition ease-out duration-200"
                enter-from-class="opacity-0 translate-y-1"
                enter-to-class="opacity-100 translate-y-0"
                leave-active-class="transition ease-in duration-150"
                leave-from-class="opacity-100 translate-y-0"
                leave-to-class="opacity-0 translate-y-1"
              >
                <MenuItems class="absolute left-0 z-10 mt-3 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                  <!-- Admin Order Items -->
                  <template v-if="isAdmin">
                    <MenuItem v-slot="{ active }">
                      <router-link 
                        to="/orders/recent"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        Recent Orders
                      </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <router-link 
                        to="/customers"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        Customers
                      </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <router-link 
                        to="/payments"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        Payment Tracking
                      </router-link>
                    </MenuItem>
                  </template>
                  <!-- Rep Order Items -->
                  <template v-if="isRep">
                    <MenuItem v-slot="{ active }">
                      <router-link 
                        to="/commissions"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        Commissions
                      </router-link>
                    </MenuItem>
                  </template>
                  <!-- Doctor Order Items -->
                  <template v-if="isDoctor">
                    <MenuItem v-slot="{ active }">
                      <router-link 
                        to="/orders"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        My Orders
                      </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <router-link 
                        to="/payments"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        Payments
                      </router-link>
                    </MenuItem>
                  </template>
                </MenuItems>
              </transition>
            </Menu>

            <!-- Admin Only: Representatives Dropdown -->
            <template v-if="isAdmin">
              <Menu as="div" class="relative">
                <MenuButton 
                  class="inline-flex items-center px-1 pt-1 text-sm font-medium text-gray-500 hover:text-gray-700"
                >
                  Representatives
                  <ChevronDownIcon class="ml-1 h-4 w-4" />
                </MenuButton>
                <transition
                  enter-active-class="transition ease-out duration-200"
                  enter-from-class="opacity-0 translate-y-1"
                  enter-to-class="opacity-100 translate-y-0"
                  leave-active-class="transition ease-in duration-150"
                  leave-from-class="opacity-100 translate-y-0"
                  leave-to-class="opacity-0 translate-y-1"
                >
                  <MenuItems class="absolute left-0 z-10 mt-3 w-48 origin-top-left rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                    <MenuItem v-slot="{ active }">
                      <router-link 
                        to="/reps"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        List of Reps
                      </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <router-link 
                        to="/commissions"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        Commissions
                      </router-link>
                    </MenuItem>
                    <MenuItem v-slot="{ active }">
                      <router-link 
                        to="/commissions/approval"
                        :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                      >
                        Commission Approval
                      </router-link>
                    </MenuItem>
                  </MenuItems>
                </transition>
              </Menu>
            </template>

            <!-- Reports Link (Available to all roles) -->
            <router-link 
              to="/reports" 
              class="inline-flex items-center px-1 pt-1 text-sm font-medium"
              :class="[route.path === '/reports' ? 'border-indigo-500 text-gray-900 border-b-2' : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700']"
            >
              Reports
            </router-link>
          </div>
        </div>

        <!-- Right side buttons -->
        <div class="flex items-center">
          <!-- New Order Button -->
          <router-link 
            to="/orders/new"
            class="ml-3 inline-flex items-center rounded-md bg-indigo-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-indigo-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-indigo-600"
          >
            <PlusIcon class="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
            New Order
          </router-link>

          <!-- Profile Dropdown -->
          <Menu as="div" class="relative ml-3">
            <div>
              <MenuButton class="relative flex rounded-full bg-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2">
                <span class="sr-only">Open user menu</span>
                <div class="h-8 w-8 rounded-full bg-gray-200 flex items-center justify-center">
                  <span class="text-sm font-medium text-gray-600">
                    {{ userInitials }}
                  </span>
                </div>
              </MenuButton>
            </div>
            <transition
              enter-active-class="transition ease-out duration-200"
              enter-from-class="opacity-0 translate-y-1"
              enter-to-class="opacity-100 translate-y-0"
              leave-active-class="transition ease-in duration-150"
              leave-from-class="opacity-100 translate-y-0"
              leave-to-class="opacity-0 translate-y-1"
            >
              <MenuItems class="absolute right-0 z-10 mt-2 w-48 origin-top-right rounded-md bg-white py-1 shadow-lg ring-1 ring-black ring-opacity-5 focus:outline-none">
                <MenuItem v-slot="{ active }">
                  <router-link
                    to="/profile"
                    :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                  >
                    Your Profile
                  </router-link>
                </MenuItem>
                <MenuItem v-slot="{ active }">
                  <a
                    href="#"
                    @click.prevent="handleLogout"
                    :class="[active ? 'bg-gray-100' : '', 'block px-4 py-2 text-sm text-gray-700']"
                  >
                    Sign out
                  </a>
                </MenuItem>
              </MenuItems>
            </transition>
          </Menu>
        </div>
      </div>
    </div>
  </nav>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useAuthStore } from '../../../stores/auth';
import { Menu, MenuButton, MenuItem, MenuItems } from '@headlessui/vue';
import { ChevronDownIcon, PlusIcon } from '@heroicons/vue/20/solid';

const router = useRouter();
const route = useRoute();
const authStore = useAuthStore();

const isAdmin = computed(() => authStore.isAdmin);
const isRep = computed(() => authStore.isRep);
const isDoctor = computed(() => authStore.isDoctor);

const userName = computed(() => authStore.userRole?.name || 'User');
const userInitials = computed(() => {
  const name = userName.value;
  return name
    .split(' ')
    .map((word: string) => word[0])
    .join('')
    .toUpperCase();
});

const handleLogout = async () => {
  await authStore.logout();
  router.push('/login');
};
</script>
