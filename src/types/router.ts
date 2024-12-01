export interface RouteLocationNormalized {
  path: string
  name?: string | null
  params: Record<string, string>
  query: Record<string, string | string[]>
  hash: string
  fullPath: string
  matched: RouteRecord[]
  meta: Record<string, any>
}

export interface RouteRecord {
  path: string
  name?: string
  meta: Record<string, any>
  children?: RouteRecord[]
}

export type NavigationGuardNext = (
  to?: string | 
  { 
    name?: string; 
    path?: string; 
    query?: Record<string, string>; 
    replace?: boolean 
  } | 
  false | 
  void
) => void

export interface RouteComponent {
  (): Promise<any>
}

export interface RouteRecordRaw {
  path: string
  name?: string
  component: RouteComponent
  meta?: {
    requiresAuth?: boolean
    [key: string]: any
  }
  children?: RouteRecordRaw[]
}

export interface RouterOptions {
  history: any
  routes: RouteRecordRaw[]
}

export interface Router {
  options: RouterOptions
  beforeEach(guard: NavigationGuard): void
  afterEach(hook: NavigationHook): void
  push(to: RouteLocationRaw): Promise<void>
  replace(to: RouteLocationRaw): Promise<void>
  back(): void
  forward(): void
  go(delta: number): void
}

export type NavigationGuard = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized,
  next: NavigationGuardNext
) => Promise<void> | void

export type NavigationHook = (
  to: RouteLocationNormalized,
  from: RouteLocationNormalized
) => void

export type RouteLocationRaw = string | {
  name?: string
  path?: string
  query?: Record<string, string | string[]>
  params?: Record<string, string>
  hash?: string
}
