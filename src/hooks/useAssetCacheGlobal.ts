import React, {cache, useCallback, useSyncExternalStore, useTransition} from 'react';
import {remove} from '../utils';

const GlobalCacheStore = {
  cache: new Map<string, Promise<any>>(),
  listeners: [] as (() => void)[],

  reset: () => {
    GlobalCacheStore.cache = new Map<string, Promise<any>>();
    console.log('reset  ->', GlobalCacheStore.listeners);
    GlobalCacheStore.listeners.forEach(l => l());
  },
  set: <T>(key: string, promise: Promise<T>) => {
    const newCache = new Map<string, Promise<any>>();
    newCache.set(key, promise);
    GlobalCacheStore.cache = newCache;
    console.log('set ->', GlobalCacheStore.listeners);
    GlobalCacheStore.listeners.forEach(l => l());
  },

  subscribe: (listener: () => void) => {
    GlobalCacheStore.listeners = [...GlobalCacheStore.listeners, listener];
    console.log('subscribe ->', GlobalCacheStore.listeners);
    return () => {
      console.log('unsubscribe ->', GlobalCacheStore.listeners);
      GlobalCacheStore.listeners = GlobalCacheStore.listeners.filter(l => l !== listener);
    };
  },
  getSnapshot: () => {
    return GlobalCacheStore.cache;
  },
};

export const clearCache = () => {
  GlobalCacheStore.reset();
};

const useCacheRefresh = () => {
  return useCallback(() => {
    GlobalCacheStore.reset();
  }, []);
};

// TODO: Cache should be a map of keys to promises, and their destination cache with the the asset keys they resolve to
// TODO: We can allow the user to optionally purge the entire cache or the cache for a specific key
// TODO: We can not selectively replace specific keys with the public api when refreshing, but we can control the backing cache
// TODO: When you hit an error boundary for an asset, you may want to try loading the asset again, and if that fails, you may want to purge the cache

export function loadFromCache<T>(
  cache: Map<string, Promise<T>>,
  key: Set<string>,
  load: () => Promise<T>,
) {
  console.log('loadFromCache ->', key, cache);
  const cacheKey = Array.from(key).join('|');
  let promise = cache.get(cacheKey);
  if (!promise) {
    promise = load();
    GlobalCacheStore.set(cacheKey, promise);
  }
  return promise;
}

export function usePromiseCache<T>() {
  return useSyncExternalStore(GlobalCacheStore.subscribe, GlobalCacheStore.getSnapshot);
}

// TODO: Store keys along with the promises so we can purge the Asset cache when we refresh or clear the cache
export function useAssetCache() {
  //const cache = getPromiseCache();
  const cacheRefresh = useCacheRefresh();
  const [isPending, startTransition] = useTransition();

  const refresh = useCallback(
    (keys?: string[]) => {
      // When we purge we need to reset the cache for the keys that are being purged
      startTransition(() => {
        remove(keys);
        cacheRefresh();
      });
    },
    [cacheRefresh],
  );

  const clear = useCallback(
    (_: boolean = false) => {
      // TODO: Walk everything in current promise cache and clear it
      // TODO: If all is set, reset the entire backing cache instead
      startTransition(() => {
        cacheRefresh();
      });
    },
    [cacheRefresh],
  );

  return [isPending, refresh, clear] as const;
}
