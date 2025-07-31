import {useEffect, useRef, useState} from 'react';
import {isLoaded, load, resolve} from './utils';

import type {UnresolvedAsset} from 'pixi.js';
import type {AssetState, AssetUrl, HookState} from './types';
import {useAssetCache} from './useAssetCache';

export function useAssets<T>(urls: string | UnresolvedAsset): AssetState<T | undefined>;
export function useAssets<T>(urls: string[] | UnresolvedAsset[]): AssetState<Record<string, T>>;

export function useAssets<T>(urls: AssetUrl) {
  const cache = useAssetCache<T, AssetUrl>({urls, isLoaded, load, resolve});
  const sync = useRef(new WeakSet<Promise<unknown>>());
  const [state, setState] = useState<HookState<T | Record<string, T>>>(() => ({
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
