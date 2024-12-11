import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';
import type { RouteLocationNormalized, RouteRecordRaw, NavigationGuardNext } from '../types/router';

// Utility function to check if a user has the required role
const hasRole = (roles: string[], userRole?: string): boolean => {
  if (!roles || !userRole) return false;
  return roles.includes(userRole);
};

// Define routes based on roles
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

  // Common routes (available to all authenticated users)
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
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/commission-approval',
    name: 'commission-approval',
    component: () => import('../views/CommissionApproval.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/analytics',
    name: 'analytics',
    component: () => import('../views/Analytics.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },
  {
    path: '/admin/orders',
    name: 'all-orders',
    component: () => import('../views/orders/OrderList.vue'),
    meta: { requiresAuth: true, roles: ['admin'] },
  },

  // Rep routes
  {
    path: '/rep/dashboard',
    name: 'rep-dashboard',
    component: () => import('../views/rep/RepDashboard.vue'),
    meta: { requiresAuth: true, roles: ['rep'] },
  },
  {
    path: '/rep/commissions',
    name: 'rep-commissions',
    component: () => import('../views/CommissionDashboard.vue'),
    meta: { requiresAuth: true, roles: ['rep'] },
  },
  {
    path: '/rep/doctors',
    name: 'my-doctors',
    component: () => import('../views/MyDoctors.vue'),
    meta: { requiresAuth: true, roles: ['rep'] },
  },
  {
    path: '/rep/stats',
    name: 'my-stats',
    component: () => import('../views/MyStats.vue'),
    meta: { requiresAuth: true, roles: ['rep'] },
  },
  {
    path: '/rep/orders/new',
    name: 'new-order',
    component: () => import('../views/orders/OrderForm.vue'),
    meta: { requiresAuth: true, roles: ['rep'] },
  },

  // Doctor routes
  {
    path: '/doctor/orders',
    name: 'my-orders',
    component: () => import('../views/orders/OrderList.vue'),
    meta: { requiresAuth: true, roles: ['doctor'] },
  },
  {
    path: '/doctor/payments',
    name: 'payment-tracking',
    component: () => import('../views/PaymentTracking.vue'),
    meta: { requiresAuth: true, roles: ['doctor'] },
  },

  // Shared routes (available to multiple roles)
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
  {
    path: '/graft-orders',
    redirect: '/admin/orders',
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

// Improved navigation guard with proper async handling
router.beforeEach(async (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => {
  const authStore = useAuthStore();

  try {
    // Only check auth if not already checked
    if (!authStore.authChecked) {
      await authStore.checkAuth();
    }

    // Handle auth routes (login/register)
    if (to.meta?.requiresAuth === false) {
      if (authStore.isAuthenticated) {
        return next('/dashboard');
      }
      return next();
    }

    // Check if route requires authentication
    if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
      return next({
        name: 'login',
        query: { redirect: to.fullPath },
      });
    }

    // Check for role-based access
    if (to.meta?.roles) {
      const userRole = authStore.userRole?.role;
      if (!hasRole(to.meta.roles, userRole)) {
        console.warn('Access denied: User role not authorized');
        return next('/dashboard');
      }
    }

    next();
  } catch (error) {
    console.error('Navigation guard error:', error);
    // On error, redirect to login
    return next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
  }
});

export default router;
