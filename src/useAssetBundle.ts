import {useEffect, useRef, useState} from 'react';
import {useAssetCache} from './hooks/useAssetCache';
import {isBundleLoaded, loadBundle, resolveBundle} from './utils';

import type {AssetState, HookState} from './types';

export function useAssetBundle<T extends Record<string, unknown>>(
  bundles: string | string[],
): AssetState<T> {
  const cache = useAssetCache<T, string | string[]>({
    urls: bundles,
    isLoaded: isBundleLoaded,
    load: loadBundle,
    resolve: resolveBundle,
  });
  const sync = useRef(new WeakSet<Promise<unknown>>());
  const [state, setState] = useState<HookState<T>>(() => ({
    data: cache.data,
    error: null,
  }));

  useEffect(() => {
    if (cache.data === null && !sync.current.has(cache.promise)) {
      cache.promise
        .then(data => {
          if (sync.current.has(cache.promise)) {
            setState({
              data,
              error: null,
            });
          }
          return data;
        })
        .catch(error => {
          if (sync.current.has(cache.promise)) {
            setState({
              data: null,
              error,
            });
          }
        });
    }
    sync.current = new WeakSet([cache.promise]);
  }, [cache.promise, cache.data]);

  if (state.error) {
    return {
      status: 'error',
      isLoaded: false,
      data: null,
      error: state.error,
    };
  }
  if (state.data) {
    return {
      status: 'loaded',
      isLoaded: true,
      data: state.data,
      error: null,
    };
  }
  return {
    status: 'pending',
    isLoaded: false,
    data: null,
    error: null,
  };
}
