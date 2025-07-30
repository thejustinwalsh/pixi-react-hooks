import {useCallback, useMemo} from 'react';
import {useStore, createStore} from 'react-concurrent-store';
import {createKey, hashKey, remove} from '../utils';
import {AssetUrl} from '../types';

type AssetCache<T extends any = any> =
  | {
      isLoaded: true;
      key: Set<string>;
      data: T;
      promise: Promise<T>;
      hash?: string;
    }
  | {
      isLoaded: false;
      key: Set<string>;
      data: null;
      promise: Promise<T>;
      hash?: string;
    }
  | {
      isLoaded: boolean;
      key: Set<string>;
      data: T | null;
      promise?: Promise<T>;
      hash?: string;
    };

type AssetCacheProps<T extends unknown = unknown, P extends AssetUrl = AssetUrl> = {
  urls: P;
  isLoaded: (urls: P) => boolean;
  load: (urls: P) => Promise<T>;
  resolve: (urls: P) => T;
};

type AssetCacheAction<T extends unknown = unknown> =
  | {type: 'load'; payload: AssetCache<T>}
  | {type: 'reload'; payload: AssetCache<T>};

const PromiseCache = new Map<string, AssetCache>();

const selector = (state: AssetCache, replace: boolean = false) => {
  const hash = state.hash || hashKey(state.key);
  if (!replace && PromiseCache.has(hash)) {
    return PromiseCache.get(hash)!;
  }
  return PromiseCache.set(hash, {...state, hash}).get(hash)!;
};

const storeReducer = (_: AssetCache, action: AssetCacheAction) => {
  switch (action.type) {
    case 'load': {
      return selector(action.payload);
    }
    case 'reload': {
      return selector(action.payload, true);
    }
  }
};

function loadFromCache<T extends unknown, P extends AssetUrl>({
  urls,
  isLoaded,
  load,
  resolve,
}: AssetCacheProps<T, P>) {
  const hash = hashKey(createKey(urls));
  if (PromiseCache.has(hash)) {
    return selector(PromiseCache.get(hash)!);
  }

  const key = createKey(urls);
  const loaded = isLoaded(urls);
  const data = loaded ? resolve(urls) : null;
  const promise = loaded ? Promise.resolve(data) : load(urls);
  return selector({isLoaded: loaded, key, data, promise});
}

export function clear() {
  PromiseCache.clear();
  remove();
}

export function reset(keys?: string[]) {
  if (keys) {
    keys.forEach(key => PromiseCache.delete(key));
  } else {
    clear();
  }
}

export function useAssetCache<T extends unknown, P extends AssetUrl>({
  urls,
  isLoaded,
  load,
  resolve,
}: AssetCacheProps<T, P>) {
  const store = useMemo(() => {
    const cache = loadFromCache({urls, isLoaded, load, resolve});
    return createStore<AssetCache<T>, AssetCacheAction<T>>(
      {...cache, hash: hashKey(cache.key)},
      storeReducer,
    );
  }, [isLoaded, load, resolve, urls]);

  const cache = useStore(store);

  const loader = useCallback(() => {
    const payload = loadFromCache<T, P>({urls, isLoaded, load, resolve});
    store.update({type: 'load', payload});
    return payload;
  }, [store, isLoaded, load, resolve, urls]);

  return {cache, load: loader};
}
