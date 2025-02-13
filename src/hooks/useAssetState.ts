import React, {useMemo} from 'react';
import {useEffect, useState} from 'react';
import {didKeyChange, createKey} from '../utils';
import {loadFromCache, usePromiseCache} from './useAssetCache';

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

export function useAssetState<T, P extends AssetUrl>(
  urls: P,
  isLoaded: (urls: P) => boolean,
  load: <T>(urls: P) => Promise<T>,
  resolve: <T>(urls: P) => T,
): AssetStateReturn<T> {
  const key = useMemo(() => createKey(urls), [urls]);
  const cache = usePromiseCache<T>();
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

  const [state, setState] = useState<HookState<T>>(() => ({
    thenable: !assetState.isLoaded ? loadFromCache(cache, key, () => load(urls)) : null,
    key,
  }));

  useEffect(() => {
    if (didKeyChange(urls, state.key)) {
      if (isLoaded(urls)) {
        setAssetState({status: 'loaded', isLoaded: true, error: null, data: resolve(urls)});
        setState(state => ({...state, key}));
      } else {
        setState({thenable: loadFromCache(cache, key, () => load(urls)), key});
        setAssetState({status: 'pending', isLoaded: false, error: null, data: null});
      }
    }
  }, [cache, isLoaded, key, load, resolve, state.key, urls]);

  if (assetState.status === 'error') {
    return [assetState, setAssetState, state.thenable!] as const;
  }

  if (assetState.status === 'pending') {
    return [assetState, setAssetState, state.thenable!] as const;
  }

  return [assetState, setAssetState, state.thenable!] as const;
}
