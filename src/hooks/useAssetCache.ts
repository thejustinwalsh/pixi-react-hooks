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
    : load(urls).finally(() =>
        store.update({
          type: 'set',
          payload: {
            key,
            data,
            promise,
            hash,
          },
        }),
      );
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
    // set: Direct cache mutation, skip re-render
    case 'set': {
      return current.set(action.payload.hash, action.payload);
    }
    // reset: Direct cache clear, then trigger a re-render
    case 'reset': {
      if (action.payload) {
        remove();
      }
      current.clear();
      return new Map(current);
    }
  }
};

const store = createStore<AssetCache, AssetCacheAction>(new Map(), storeReducer);

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

export function reset(keys?: string[]) {
  if (keys) {
    store.update({
      type: 'remove',
      payload: {urls: keys},
    });
  } else {
    store.update({
      type: 'reset',
    });
  }
}

export function useAssetCacheActions() {
  return {clear, reset, refresh};
}

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
