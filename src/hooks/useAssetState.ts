import React from 'react';
import {useEffect, useState} from 'react';
import {didKeyChange, createKey} from '../utils';

import type {
  AssetState,
  HookState,
  PendingAssetState,
  LoadedAssetState,
  ErrorAssetState,
  AssetUrl,
} from '../types';

type LoadedAssetStateReturn<T> = readonly [
  LoadedAssetState<T>,
  React.Dispatch<React.SetStateAction<AssetState<T>>>,
  Promise<T> | null,
];

type PendingAssetStateReturn<T> = readonly [
  PendingAssetState,
  React.Dispatch<React.SetStateAction<AssetState<T>>>,
  Promise<T>,
];

type ErrorAssetStateReturn<T> = readonly [
  ErrorAssetState,
  React.Dispatch<React.SetStateAction<AssetState<T>>>,
  Promise<T>,
];

type AssetStateReturn<T> =
  | LoadedAssetStateReturn<T>
  | PendingAssetStateReturn<T>
  | ErrorAssetStateReturn<T>;

const getCacheForType = <T>(resourceType: () => T) =>
  React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.A.getCacheForType(
    resourceType,
  );

const createPromiseCache = <T>() => new Map<string, Promise<T>>();
const getPromiseCache = <T>() => getCacheForType(createPromiseCache<T>);

function loadFromCache<T>(key: Set<string>, load: () => Promise<T>) {
  const cache = getPromiseCache<T>();
  const cacheKey = Array.from(key).join('|');

  let promise = cache.get(cacheKey);
  if (!promise) promise = load();

  cache.set(cacheKey, promise);
  return promise;
}

export function useAssetState<T, P extends AssetUrl>(
  urls: P,
  isLoaded: (urls: P) => boolean,
  load: <T>(urls: P) => Promise<T>,
  resolve: <T>(urls: P) => T,
): AssetStateReturn<T> {
  const [assetState, setAssetState] = useState<AssetState<T>>(() => {
    const loaded = isLoaded(urls);
    return loaded
      ? {
          status: 'loaded',
          isLoaded: true,
          error: null,
          data: resolve(urls),
        }
      : {
          status: 'pending',
          isLoaded: false,
          error: null,
          data: null,
        };
  });

  const [state, setState] = useState<HookState<T>>(() => {
    const key = createKey(urls);
    return {
      thenable: !assetState.isLoaded ? loadFromCache(key, () => load(urls)) : null,
      key,
    };
  });

  useEffect(() => {
    if (didKeyChange(urls, state.key)) {
      const assetsLoaded = isLoaded(urls);
      setState(state => ({
        thenable: assetsLoaded ? state.thenable : load(urls),
        key: createKey(urls),
      }));
      setAssetState(
        assetsLoaded
          ? {status: 'loaded', isLoaded: true, error: null, data: resolve(urls)}
          : {status: 'pending', isLoaded: false, error: null, data: null},
      );
    }
  }, [urls, state.key, isLoaded, resolve, load]);

  if (assetState.status === 'error') {
    return [assetState, setAssetState, state.thenable!] as const;
  }

  if (assetState.status === 'pending') {
    return [assetState, setAssetState, state.thenable!] as const;
  }

  return [assetState, setAssetState, state.thenable] as const;
}
