import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import { ROLES } from '../constants/roles'; // Optional, for centralized role definitions
import type { RouteRecordRaw, RouteLocationNormalized, NavigationGuardNext } from 'vue-router';

// Middleware for authentication
const checkAuth = async (authStore: any, to: RouteLocationNormalized, next: NavigationGuardNext) => {
  if (!authStore.authChecked) {
    await authStore.checkAuth();
  }

  if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
  }
};

// Middleware for role-based access
const checkRole = (authStore: any, to: RouteLocationNormalized, next: NavigationGuardNext) => {
  const userRole = authStore.userRole?.role;
  if (to.meta?.roles && (!userRole || !to.meta.roles.includes(userRole))) {
    console.warn(`Access denied for user role: ${userRole}`);
    return next('/dashboard');
  }
};

// Define your routes
const routes: RouteRecordRaw[] = [
  // Public routes
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
    meta: { requiresAuth: false },
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue'),
    meta: { requiresAuth: false },
  },

  // Common routes (all authenticated users)
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/profile',
    name: 'profile',
    component: () => import('../views/CustomerProfile.vue'),
    meta: { requiresAuth: true },
  },

  // Admin-only routes
  {
    path: '/admin/commission-structure',
    name: 'commission-structure',
    component: () => import('../views/CommissionStructureManagement.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: '/admin/commission-approval',
    name: 'commission-approval',
    component: () => import('../views/CommissionApproval.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: '/admin/analytics',
    name: 'analytics',
    component: () => import('../views/Analytics.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },
  {
    path: '/admin/orders',
    name: 'all-orders',
    component: () => import('../views/orders/OrderList.vue'),
    meta: { requiresAuth: true, roles: [ROLES.ADMIN] },
  },

  // Rep-only routes
  {
    path: '/rep/dashboard',
    name: 'rep-dashboard',
    component: () => import('../views/rep/RepDashboard.vue'),
    meta: { requiresAuth: true, roles: [ROLES.REP] },
  },
  {
    path: '/rep/commissions',
    name: 'rep-commissions',
    component: () => import('../views/CommissionDashboard.vue'),
    meta: { requiresAuth: true, roles: [ROLES.REP] },
  },
  {
    path: '/rep/doctors',
    name: 'my-doctors',
    component: () => import('../views/MyDoctors.vue'),
    meta: { requiresAuth: true, roles: [ROLES.REP] },
  },
  {
    path: '/rep/orders/new',
    name: 'new-order',
    component: () => import('../views/orders/OrderForm.vue'),
    meta: { requiresAuth: true, roles: [ROLES.REP] },
  },

  // Doctor-only routes
  {
    path: '/doctor/orders',
    name: 'my-orders',
    component: () => import('../views/orders/OrderList.vue'),
    meta: { requiresAuth: true, roles: [ROLES.DOCTOR] },
  },
  {
    path: '/doctor/payments',
    name: 'payment-tracking',
    component: () => import('../views/PaymentTracking.vue'),
    meta: { requiresAuth: true, roles: [ROLES.DOCTOR] },
  },

  // Shared routes
  {
    path: '/orders/:id',
    name: 'order-details',
    component: () => import('../components/orders/OrderDetails.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('../views/FinancialReporting.vue'),
    meta: { requiresAuth: true },
  },

  // Legacy redirects
  {
    path: '/doctors',
    redirect: '/admin/customers',
  },
  {
    path: '/financial-reports',
    redirect: '/reports',
  },

  // Catch-all redirect
  {
    path: '/:pathMatch(.*)*',
    redirect: '/dashboard',
  },
];

// Create the router instance
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Global navigation guard
router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  try {
    // Middleware checks
    await checkAuth(authStore, to, next);
    checkRole(authStore, to, next);

    next();
  } catch (error) {
    console.error('Navigation guard error:', error);
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
  }
});

export default router;