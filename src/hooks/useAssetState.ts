import {useEffect, useState} from 'react';
import {didKeyChange, createKey} from '../utils';

import {Assets, type UnresolvedAsset} from 'pixi.js';
import type {AssetState, HookState} from '../types';

type AssetStateReturn<T> = [
  AssetState<T>,
  React.Dispatch<React.SetStateAction<AssetState<T>>>,
  Promise<T> | null,
];

export function useAssetState<T>(
  urls: string | UnresolvedAsset | string[] | UnresolvedAsset[],
  isLoaded: (urls: any) => boolean,
  load: <T>(urls: any) => Promise<T>,
  resolve: <T>(urls: any) => T,
): AssetStateReturn<T | Record<string, T> | null> {
  const [assetState, setAssetState] = useState<AssetState<T | Record<string, T> | null>>(() => {
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
    thenable: !assetState.isLoaded ? load(urls) : null,
    key: createKey(urls),
  }));

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

  return [assetState, setAssetState, state.thenable] as const;
}
