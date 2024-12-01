import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

interface RouteLocation {
  meta: {
    requiresAuth?: boolean;
  };
  fullPath: string;
}

interface NavigationGuard {
  (to: RouteLocation, from: RouteLocation, next: (arg?: any) => void): void;
}

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
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
    path: '/graft-orders',
    name: 'graft-orders',
    component: () => import('../views/orders/OrderList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/customers',
    name: 'customers',
    component: () => import('../views/CustomerManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/financial-reports',
    name: 'financial-reports',
    component: () => import('../views/FinancialReporting.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/payments',
    name: 'payments',
    component: () => import('../views/PaymentTracking.vue'),
    meta: { requiresAuth: true }
  },
  // Legacy routes for backward compatibility
  {
    path: '/orders',
    redirect: '/graft-orders'
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
    redirect: '/customers'
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard with basic types
const beforeEach: NavigationGuard = async (to, from, next) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    next({ 
      name: 'login', 
      query: { redirect: to.fullPath } 
    })
  } else {
    next()
  }
}

router.beforeEach(beforeEach)

export default router
