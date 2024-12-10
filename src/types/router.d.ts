declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: string[];
  }
}

export interface RouteLocationNormalized {
  path: string;
  name?: string | null;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
  fullPath: string;
  matched: RouteRecordNormalized[];
  meta: {
    requiresAuth?: boolean;
    roles?: string[];
  };
  redirectedFrom?: RouteLocationNormalized;
}

export interface RouteRecordNormalized {
  path: string;
  name?: string | null;
  meta: {
    requiresAuth?: boolean;
    roles?: string[];
  };
  children?: RouteRecordNormalized[];
}

export interface RouteLocationOptions {
  replace?: boolean;
  name?: string | null;
  query?: Record<string, string>;
}

export type NavigationGuardNext = (to?: string | RouteLocationOptions | false | void) => void;

export interface RouteRecordRaw {
  path: string;
  name?: string;
  component?: () => Promise<any>;
  components?: Record<string, () => Promise<any>>;
  redirect?: string | ((to: RouteLocationNormalized) => string);
  meta?: {
    requiresAuth?: boolean;
    roles?: string[];
  };
  children?: RouteRecordRaw[];
  props?: boolean | Record<string, any> | ((to: RouteLocationNormalized) => Record<string, any>);
}
