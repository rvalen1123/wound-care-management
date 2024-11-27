import { createRouter, createWebHistory } from 'vue-router'
import DashboardView from '@/views/Dashboard.vue'
import GraftOrderManagement from '@/views/GraftOrderManagement.vue'
import CustomerManagement from '@/views/CustomerManagement.vue'
import FinancialReporting from '@/views/FinancialReporting.vue'
import PaymentTracking from '@/views/PaymentTracking.vue'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: DashboardView
  },
  {
    path: '/graft-orders',
    name: 'GraftOrders',
    component: GraftOrderManagement
  },
  {
    path: '/customers',
    name: 'Customers',
    component: CustomerManagement
  },
  {
    path: '/financial-reports',
    name: 'FinancialReports',
    component: FinancialReporting
  },
  {
    path: '/payments',
    name: 'Payments',
    component: PaymentTracking
  }
]

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
})

export default router
