import { createRouter, createWebHistory } from 'vue-router'
import type { RouteLocationNormalized, NavigationGuardNext } from 'vue-router'
import '@/types/router'
import { useAuthStore } from '@/stores/auth'

const routes = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('@/views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('@/views/Login.vue')
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('@/views/orders/OrderList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/new',
    name: 'new-order',
    component: () => import('@/views/orders/OrderForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/:id/edit',
    name: 'edit-order',
    component: () => import('@/views/orders/OrderForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reps',
    name: 'reps',
    component: () => import('@/views/rep/RepDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/doctors',
    name: 'doctors',
    component: () => import('@/views/CustomerManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('@/views/FinancialReporting.vue'),
    meta: { requiresAuth: true }
  }
] as const

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard with proper types
router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ 
      name: 'login', 
      query: { redirect: to.fullPath } 
    })
  } else {
    next()
  }
})

export default router

// Export type-safe router instance
export type Router = typeof router
