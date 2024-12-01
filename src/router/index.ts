import { createRouter, createWebHistory } from 'vue-router'
import type { RouteRecordRaw, NavigationGuardNext, RouteLocationNormalized } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

// Views
import DashboardView from '@/views/Dashboard.vue'
import GraftOrderManagement from '@/views/GraftOrderManagement.vue'
import CustomerManagement from '@/views/CustomerManagement.vue'
import CustomerProfile from '@/views/CustomerProfile.vue'
import FinancialReporting from '@/views/FinancialReporting.vue'
import PaymentTracking from '@/views/PaymentTracking.vue'
import OrderDetails from '@/views/OrderDetails.vue'
import Login from '@/components/Login.vue'
import Register from '@/views/Register.vue'
import ManufacturerManagement from '@/views/ManufacturerManagement.vue'
import OrderForm from '@/views/OrderForm.vue'
import CommissionStructureManagement from '@/views/CommissionStructureManagement.vue'
import RepDashboard from '@/components/rep/RepDashboard.vue'

const routes: RouteRecordRaw[] = [
  {
    path: '/',
    name: 'Home',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: Login,
    meta: { requiresAuth: false }
  },
  {
    path: '/register',
    name: 'Register',
    component: Register,
    meta: { requiresAuth: false }
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/graft-order-management',
    name: 'GraftOrderManagement',
    component: GraftOrderManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/customer-management',
    name: 'CustomerManagement',
    component: CustomerManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/customer/:id',
    name: 'CustomerProfile',
    component: CustomerProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/financial-reporting',
    name: 'FinancialReporting',
    component: FinancialReporting,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/payment-tracking',
    name: 'PaymentTracking',
    component: PaymentTracking,
    meta: { requiresAuth: true }
  },
  {
    path: '/order/:id',
    name: 'OrderDetails',
    component: OrderDetails,
    meta: { requiresAuth: true }
  },
  {
    path: '/order-form',
    name: 'OrderForm',
    component: OrderForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/manufacturer-management',
    name: 'ManufacturerManagement',
    component: ManufacturerManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/commission-structure',
    name: 'CommissionStructureManagement',
    component: CommissionStructureManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/rep/dashboard',
    name: 'RepDashboard',
    component: RepDashboard,
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const authStore = useAuthStore()
  
  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return { name: 'login', query: { redirect: to.fullPath } }
  }
})

export default router
