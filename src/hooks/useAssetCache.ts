import React, {useCallback, useTransition} from 'react';
import {remove} from '../utils';

const getCacheForType = <T>(resourceType: () => T) =>
  React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.A.getCacheForType(
    resourceType,
  );

const useCacheRefresh = () =>
  React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.H.useCacheRefresh();

const createPromiseCache = <T>() => new Map<string, Promise<T>>();

// TODO: Cache should be a map of keys to promises, and their destination cache with the the asset keys they resolve to
// TODO: We can allow the user to optionally purge the entire cache or the cache for a specific key
// TODO: We can not selectively replace specific keys with the public api when refreshing, but we can control the backing cache
// TODO: When you hit an error boundary for an asset, you may want to try loading the asset again, and if that fails, you may want to purge the cache

export function loadFromCache<T>(
  cache: Map<string, Promise<T>>,
  key: Set<string>,
  load: () => Promise<T>,
) {
  const cacheKey = Array.from(key).join('|');
  let promise = cache.get(cacheKey);
  if (!promise) {
    promise = load();
    cache.set(cacheKey, promise);
  }
  return promise;
}

export function usePromiseCache<T>() {
  return getCacheForType(createPromiseCache<T>);
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
