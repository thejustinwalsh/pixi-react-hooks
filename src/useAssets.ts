import {useEffect} from 'react';
import {useAssetState} from './hooks/useAssetState';
import {isLoaded, load, resolve} from './utils';

import type {UnresolvedAsset} from 'pixi.js';
import type {AssetState} from './types';

export function useAssets<T>(urls: string | UnresolvedAsset): AssetState<T | undefined>;
export function useAssets<T>(urls: string[] | UnresolvedAsset[]): AssetState<Record<string, T>>;

export function useAssets<T>(urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) {
  const [state, setState, thenable] = useAssetState<T>(urls, isLoaded, load, resolve);

  useEffect(() => {
    thenable
      ?.then(data => setState({isLoaded: true, error: null, data}))
      .catch(error => setState({isLoaded: true, error, data: undefined}));
  }, [setState, thenable]);

  return state;
}
