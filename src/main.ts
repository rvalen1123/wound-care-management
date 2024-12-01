import { createApp } from 'vue'
import { createPinia } from 'pinia'
import { 
  createRouter, 
  createWebHistory
} from 'vue-router'
import { createClient } from '@supabase/supabase-js'
import App from './App.vue'
import { setupPrimeVue } from './plugins/primevue'

// Import global styles
import './index.css'

// Initialize Supabase client
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables')
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Define route types
type RouteMeta = {
  requiresAuth?: boolean;
}

type AppRoute = {
  path: string;
  name: string;
  component: () => Promise<any>;
  meta?: RouteMeta;
}

// Define routes
const routes: AppRoute[] = [
  {
    path: '/',
    name: 'dashboard',
    component: () => import('./views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'login',
    component: () => import('./views/Login.vue')
  },
  {
    path: '/orders',
    name: 'orders',
    component: () => import('./views/orders/OrderList.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/new',
    name: 'new-order',
    component: () => import('./views/orders/OrderForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/orders/:id/edit',
    name: 'edit-order',
    component: () => import('./views/orders/OrderForm.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reps',
    name: 'reps',
    component: () => import('./views/rep/RepDashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/doctors',
    name: 'doctors',
    component: () => import('./views/CustomerManagement.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/reports',
    name: 'reports',
    component: () => import('./views/FinancialReporting.vue'),
    meta: { requiresAuth: true }
  }
]

// Create Vue app instance
const app = createApp(App)

// Setup store
const pinia = createPinia()
app.use(pinia)

// Setup router
const router = createRouter({
  history: createWebHistory(),
  routes
})

// Navigation guard for auth
router.beforeEach(async (to: any, from: any, next: (path?: string) => void) => {
  const { data: { session } } = await supabase.auth.getSession()
  const requiresAuth = to.matched.some((route: { meta?: RouteMeta }) => route.meta?.requiresAuth)

  if (requiresAuth && !session) {
    next('/login')
  } else if (to.path === '/login' && session) {
    next('/')
  } else {
    next()
  }
})

// Setup PrimeVue
setupPrimeVue(app)

// Error handler
interface ErrorInfo {
  message: string
  stack?: string
}

app.config.errorHandler = (
  err: unknown,
  instance: unknown,
  info: string
) => {
  const error = err as Error | ErrorInfo
  console.error('Global error:', error.message)
  console.error('Stack trace:', error.stack)
  console.error('Vue instance:', instance)
  console.error('Error info:', info)
}

// Mount app
app.use(router)
app.mount('#app')

// Export type-safe router instance
export { router }
