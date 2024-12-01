declare module 'pinia' {
  import { Ref, ComputedRef } from 'vue';

  export interface DefineStoreOptions<S, G, A> {
    id: string;
    state?: () => S;
    getters?: G;
    actions?: A;
  }

  export type StoreDefinition<Id extends string, S, G, A> = {
    $id: Id;
    $state: S;
    $patch: (partial: Partial<S>) => void;
    $reset: () => void;
    $subscribe: (callback: () => void) => void;
  } & S & G & A;

  export function defineStore<Id extends string, S, G, A>(
    id: Id,
    options: DefineStoreOptions<S, G, A>
  ): StoreDefinition<Id, S, G, A>;

  export function defineStore<Id extends string, SS>(
    id: Id,
    storeSetup: () => SS
  ): () => SS;
}
