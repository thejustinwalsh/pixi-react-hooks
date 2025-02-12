import {useEffect, useState} from 'react';
import {didKeyChange, createKey} from '../utils';

import type {UnresolvedAsset} from 'pixi.js';
import type {AssetState, HookState} from '../types';

type AssetStateReturn<T> = [
  AssetState<T>,
  React.Dispatch<React.SetStateAction<AssetState<T>>>,
  Promise<T>,
];

export function useAssetState<T>(
  urls: string | UnresolvedAsset | string[] | UnresolvedAsset[],
  isLoaded: (urls: any) => boolean,
  load: <T>(urls: any) => Promise<T>,
  resolve: <T>(urls: any) => T,
): AssetStateReturn<T | Record<string, T>> {
  const [assetState, setAssetState] = useState<AssetState<T | Record<string, T>>>(() => ({
    isLoaded: isLoaded(urls),
    error: null,
    data: resolve(urls),
  }));

  const [state, setState] = useState<HookState<T>>(() => ({
    thenable: !assetState.isLoaded ? load(urls) : undefined,
    key: createKey(urls),
  }));

  useEffect(() => {
    if (didKeyChange(urls, state.key)) {
      const assetsLoaded = isLoaded(urls);
      setState(state => ({
        thenable: assetsLoaded ? state.thenable : load(urls),
        key: createKey(urls),
      }));
      setAssetState({isLoaded: assetsLoaded, error: null, data: resolve(urls)});
    }
  }, [urls, state.key, isLoaded, resolve, load]);

  return [assetState, setAssetState, state.thenable] as const;
}
