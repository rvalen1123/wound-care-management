declare module 'vue-router' {
  interface RouteMeta {
    requiresAuth?: boolean;
    roles?: string[];
  }
}

export interface RouteLocation {
  path: string;
  name?: string;
  params: Record<string, string>;
  query: Record<string, string>;
  hash: string;
  fullPath: string;
  meta?: {
    requiresAuth?: boolean;
    roles?: string[];
  };
}

export interface RouteRecord {
  path: string;
  name?: string;
  component?: () => Promise<any>;
  redirect?: string;
  meta?: {
    requiresAuth?: boolean;
    roles?: string[];
  };
  children?: RouteRecord[];
  props?: boolean | Record<string, any> | ((to: any) => Record<string, any>);
}

export type NavigationGuardNext = (to?: string | { name: string; query: Record<string, string> }) => void;
