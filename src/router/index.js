import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'
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

const routes = [
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: DashboardView,
    meta: { requiresAuth: true }
  },
  {
    path: '/graft-orders',
    name: 'GraftOrders',
    component: GraftOrderManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/graft-orders/:id',
    name: 'OrderDetails',
    component: OrderDetails,
    meta: { requiresAuth: true }
  },
  {
    path: '/customers',
    name: 'Customers',
    component: CustomerManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/customers/:id',
    name: 'CustomerProfile',
    component: CustomerProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/financial-reports',
    name: 'FinancialReports',
    component: FinancialReporting,
    meta: { requiresAuth: true }
  },
  {
    path: '/payments',
    name: 'Payments',
    component: PaymentTracking,
    meta: { requiresAuth: true }
  },
  {
    path: '/manufacturers',
    name: 'Manufacturers',
    component: ManufacturerManagement,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/new',
    name: 'CreateOrder',
    component: OrderForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/:id/edit',
    name: 'EditOrder',
    component: OrderForm,
    meta: { requiresAuth: true }
  },
  {
    path: '/commission-structures',
    name: 'CommissionStructures',
    component: CommissionStructureManagement,
    meta: { requiresAuth: true, requiresAdmin: true }
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  
  // If route requires auth and user is not authenticated
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!authStore.isAuthenticated) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } 
  // If going to login/register while already authenticated
  else if ((to.name === 'Login' || to.name === 'Register') && authStore.isAuthenticated) {
    next({ name: 'Dashboard' })
  }
  // All other routes
  else {
    next()
  }
})

export default router
