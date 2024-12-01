/// <reference types="vite/client" />

declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_API_URL: string
  readonly VITE_APP_TITLE: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean
    roles?: string[]
  }
}

declare module '@vue/runtime-core' {
  interface ComponentCustomProperties {
    $router: import('vue-router').Router
    $route: import('vue-router').RouteLocationNormalizedLoaded
    $store: import('pinia').Store<string, any>
  }
}

declare module 'primevue/button'
declare module 'primevue/calendar'
declare module 'primevue/card'
declare module 'primevue/dropdown'
declare module 'primevue/inputnumber'
declare module 'primevue/dialog'
declare module 'primevue/toast'
declare module 'primevue/confirmdialog'
declare module 'primevue/tooltip'
declare module 'primevue/ripple'
declare module 'primevue/config'
declare module 'primevue/toastservice'
declare module 'primevue/confirmationservice'

declare module '@vuelidate/core' {
  export interface ValidationArgs {
    $model: any
    $dirty: boolean
    $error: boolean
    $invalid: boolean
    $pending: boolean
    $params: Record<string, any>
    $touch(): void
    $reset(): void
    $errors: Array<{
      $message: string
      $params: Record<string, any>
      $pending: boolean
      $property: string
    }>
  }
}
