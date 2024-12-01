import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue')
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue')
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('../views/orders/OrderList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/new',
    name: 'new-order',
    component: () => import('../views/orders/OrderForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/:id/edit',
    name: 'edit-order',
    component: () => import('../views/orders/OrderForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reps',
    name: 'reps',
    component: () => import('../views/rep/RepDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/doctors',
    name: 'doctors',
    component: () => import('../views/CustomerManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('../views/FinancialReporting.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard
router.beforeEach(async (to, from, next) => {
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
