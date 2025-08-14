import {useEffect, useMemo} from 'react';
import {useStore, createStore} from 'react-concurrent-store';
import {createKey, hashKey, remove} from '../utils';
import {AssetUrl} from '../types';

type AssetCacheValue<T extends unknown = unknown> = {
  key: Set<string>;
  data: T | null;
  promise: Promise<T>;
  hash?: string;
};

type AssetCache<T extends unknown = unknown> = Map<string, Readonly<AssetCacheValue<T>>>;

type AssetCacheProps<T extends unknown = unknown, P extends AssetUrl = AssetUrl> = {
  urls: P;
  isLoaded: (urls: P) => boolean;
  load: (urls: P) => Promise<T>;
  resolve: (urls: P) => T;
};

type AssetCacheAction<T extends unknown = unknown, P extends AssetUrl = AssetUrl> =
  | {type: 'update'; payload: Required<AssetCacheValue<T>>}
  | {type: 'remove'; payload: {urls: P}}
  | {type: 'set'; payload: Required<AssetCacheValue<T>>}
  | {type: 'reset'; payload?: boolean};

function hydrateCache<T extends unknown>(
  promise: Promise<T>,
  {
    key,
    hash,
  }: {
    key: Set<string>;
    hash: string;
  },
): Promise<T> {
  return promise
    .then(data => {
      store.update({
        type: 'set',
        payload: {
          key,
          data,
          promise,
          hash,
        },
      });
      return data;
    })
    .catch(error => {
      store.update({
        type: 'set',
        payload: {
          key,
          data: null,
          promise,
          hash,
        },
      });
      throw error;
    });
}

function loadFromCache<T extends unknown, P extends AssetUrl>(
  cache: AssetCache<T>,
  {urls, isLoaded, load, resolve}: AssetCacheProps<T, P>,
): {cached: Required<AssetCacheValue<T>>; hash: string} {
  const key = createKey(urls);
  const hash = hashKey(key);
  const cached = cache.get(hash);
  if (cached) {
    return {hash, cached: cached as Required<AssetCacheValue<T>>} as const;
  }

  const loaded = isLoaded(urls);
  const data = loaded ? resolve(urls) : null;
  const promise = loaded
    ? (Promise.resolve(data) as Promise<T>)
    : hydrateCache(load(urls), {key, hash});

  return {hash, cached: {key, data, promise, hash}} as const;
}

const storeReducer = <T extends unknown = unknown, P extends AssetUrl = AssetUrl>(
  current: AssetCache<T>,
  action: AssetCacheAction<T, P>,
) => {
  switch (action.type) {
    case 'update': {
      return new Map(current).set(action.payload.hash, action.payload);
    }
    case 'remove': {
      remove(action.payload.urls);
      const key = createKey(action.payload.urls);
      const hash = hashKey(key);
      current.delete(hash);
      return new Map(current);
    }
    case 'set': {
      // Preempt the transition and update the shared cached state (internal api)
      // - required for hydrating cache when transitioning from suspense or to error states
      // - skips re-rendering as an implementation detail
      return current.set(action.payload.hash, action.payload);
    }
    case 'reset': {
      // Preempt the transition and update the shared cached state (user api)
      // - required for resetting cache when transitioning from clearing an error state
      // - triggers re-renders when called from the user api
      if (action.payload) {
        remove();
      }
      current.clear();
      return new Map(current);
    }
  }
};

const store = createStore<AssetCache, AssetCacheAction>(new Map(), storeReducer);

/**
 * Unsafe function to clear the cache.
 * Used in tests to setup a clean state.
 * @internal
 */
export function unsafeClearCache() {
  // @ts-expect-error
  store._current = store._sync = store._transition = new Map();
}

export function clear() {
  store.update({type: 'reset', payload: true});
}

export function refresh() {
  store.update({type: 'reset'});
}

export function reset(urls: string[]) {
  if (urls.length > 0) {
    store.update({
      type: 'remove',
      payload: {urls},
    });
  }
}

/**
 * Returns actions to manipulate the asset cache.
 * @example
 * const {clear, reset, refresh} = useAssetCacheActions();
 * clear(); // Clears the entire cache, and removes all assets from the pixi.js cache
 * reset(['asset1', 'asset2']); // Resets specific assets in the cache, removing them from the pixi.js cache
 * refresh(); // Refresh the store state, keeps previous resolved assets in pixi.js cache
 */
export function useAssetCacheActions() {
  return {clear, reset, refresh};
}

/**
 * Shared hook to access the asset cache.
 * This hook is used internally by other hooks to manage asset loading and caching.
 * @internal
 */
export function useAssetCache<T extends unknown, P extends AssetUrl>({
  urls,
  isLoaded,
  load,
  resolve,
}: AssetCacheProps<T, P>) {
  const cache = useStore<AssetCache<T>>(store);
  const current = useMemo(() => {
    return loadFromCache<T, P>(cache, {urls, isLoaded, load, resolve});
  }, [cache, urls, isLoaded, load, resolve]);
  const cached = useMemo(() => cache.get(current.hash) ?? null, [cache, current.hash]);

  useEffect(() => {
    if (!cached) {
      store.update({
        type: 'update',
        payload: current.cached,
      });
    }
  }, [cached, current.cached]);

  return cached ?? current.cached;
}
