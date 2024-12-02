import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '../stores/auth';

// Define a module augmentation for route meta
declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: string[];
  }
}

// Utility function to check if a user has the required role
const hasRole = (roles: string[], userRole?: string): boolean => {
  return roles.includes(userRole || '');
};

// Define the routes
const routes = [
  {
    path: '/',
    redirect: '/dashboard',
  },
  {
    path: '/dashboard',
    name: 'dashboard',
    component: () => import('../views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('../views/Login.vue'),
  },
  {
    path: '/register',
    name: 'register',
    component: () => import('../views/Register.vue'),
  },
  {
    path: '/commissions',
    name: 'commissions',
    component: () => import('../views/CommissionDashboard.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'rep'],
    },
  },
  {
    path: '/commissions/approval',
    name: 'commission-approval',
    component: () => import('../views/CommissionApproval.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
  },
  {
    path: '/graft-orders',
    name: 'graft-orders',
    component: () => import('../views/orders/OrderList.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'rep'],
    },
  },
  {
    path: '/customers',
    name: 'customers',
    component: () => import('../views/CustomerManagement.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'rep'],
    },
  },
  {
    path: '/financial-reports',
    name: 'financial-reports',
    component: () => import('../views/FinancialReporting.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
  },
  {
    path: '/payments',
    name: 'payments',
    component: () => import('../views/PaymentTracking.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
  },
  // Legacy routes for backward compatibility
  {
    path: '/orders',
    redirect: '/graft-orders',
  },
  {
    path: '/orders/new',
    name: 'new-order',
    component: () => import('../views/orders/OrderForm.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'rep'],
    },
  },
  {
    path: '/orders/:id/edit',
    name: 'edit-order',
    component: () => import('../views/orders/OrderForm.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin', 'rep'],
    },
  },
  {
    path: '/reps',
    name: 'reps',
    component: () => import('../views/rep/RepDashboard.vue'),
    meta: {
      requiresAuth: true,
      roles: ['admin'],
    },
  },
  {
    path: '/doctors',
    name: 'doctors',
    redirect: '/customers',
  },
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

// Auth guard function to check authentication and roles
interface AuthStore {
  isAuthenticated: boolean;
  user?: {
    user_metadata?: {
      role?: string;
    };
  };
}

interface Route {
  path: string;
  name?: string;
  fullPath: string;
  meta?: {
    requiresAuth?: boolean;
    roles?: string[];
  };
}

type NavigationNext = (to?: string | { name: string; query: Record<string, string> }) => void;

// Add the navigation guard with proper type annotations
const authGuard = (to: Route, _from: Route, next: NavigationNext): void => {
  const authStore: AuthStore = useAuthStore();

  // Check if route requires authentication
  if (to.meta?.requiresAuth && !authStore.isAuthenticated) {
    next({
      name: 'login',
      query: { redirect: to.fullPath },
    });
    return;
  }

  // Check for role-based access
  if (to.meta?.roles) {
    const userRole = authStore.user?.user_metadata?.role;
    if (!hasRole(to.meta.roles, userRole)) {
      console.warn('Access denied: User role not authorized');
      next('/dashboard');
      return;
    }
  }

  // If user is authenticated and trying to access login/register, redirect to dashboard
  if (authStore.isAuthenticated && ['/login', '/register'].includes(to.path)) {
    next('/dashboard');
    return;
  }

  next();
};

// Apply the auth guard
router.beforeEach(authGuard);

// Export the router
export default router;
