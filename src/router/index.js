import { createRouter, createWebHistory } from 'vue-router'
import { useAuth } from '@/services/auth.service'
import DashboardView from '@/views/Dashboard.vue'
import GraftOrderManagement from '@/views/GraftOrderManagement.vue'
import CustomerManagement from '@/views/CustomerManagement.vue'
import CustomerProfile from '@/views/CustomerProfile.vue'
import FinancialReporting from '@/views/FinancialReporting.vue'
import PaymentTracking from '@/views/PaymentTracking.vue'
import OrderDetails from '@/views/OrderDetails.vue'
import Login from '@/components/Login.vue'
import Register from '@/views/Register.vue'

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
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

router.beforeEach((to, from, next) => {
  const { isAuthenticated } = useAuth()
  
  if (to.matched.some(record => record.meta.requiresAuth)) {
    if (!isAuthenticated.value) {
      next({ name: 'Login' })
    } else {
      next()
    }
  } else {
    next()
  }
})

export default router
