import { createApp } from 'vue';
import { createPinia } from 'pinia';
import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';
import { createClient, SupabaseClient } from '@supabase/supabase-js';
import App from './App.vue';
import { setupPrimeVue } from './plugins/primevue';

// Import global styles
import './index.css';

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase: SupabaseClient = createClient(supabaseUrl, supabaseAnonKey);

// Define routes (removing references to deleted views)
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('./views/Dashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/Login.vue'),
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('./views/orders/OrderList.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/new',
    name: 'new-order',
    component: () => import('./views/orders/OrderForm.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/orders/:id/edit',
    name: 'edit-order',
    component: () => import('./views/orders/OrderForm.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reps',
    name: 'reps',
    component: () => import('./views/rep/RepDashboard.vue'),
    meta: { requiresAuth: true },
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('./views/FinancialReporting.vue'),
    meta: { requiresAuth: true },
  },
];

// Create Vue app instance
const app = createApp(App);

// Setup Pinia store
const pinia = createPinia();
app.use(pinia);

// Setup router
const router = createRouter({
  history: createWebHistory(),
  routes,
});

// Navigation guard for authentication
router.beforeEach(async (to, from, next) => {
  const { data: { session } } = await supabase.auth.getSession();
  const requiresAuth = to.matched.some((route) => route.meta?.requiresAuth);

  if (requiresAuth && !session) {
    // Redirect to login if the route requires auth and no session exists
    next({ name: 'login', query: { redirect: to.fullPath } });
  } else if (to.name === 'login' && session) {
    // Redirect logged-in users trying to access login
    next({ name: 'dashboard' });
  } else {
    next();
  }
});

// Setup PrimeVue
setupPrimeVue(app);

// Global error handler
app.config.errorHandler = (err, instance, info) => {
  console.error('Global Error:', err);
  console.error('Instance:', instance);
  console.error('Info:', info);
};

// Mount the application
app.use(router);
app.mount('#app');

export { router };
