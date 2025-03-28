import {useEffect} from 'react';
import {useAssetState} from './hooks/useAssetState';
import {isLoaded, load, resolve} from './utils';

import type {UnresolvedAsset} from 'pixi.js';
import type {AssetState, AssetUrl} from './types';

export function useAssets<T>(urls: string | UnresolvedAsset): AssetState<T | undefined>;
export function useAssets<T>(urls: string[] | UnresolvedAsset[]): AssetState<Record<string, T>>;

export function useAssets<T>(urls: AssetUrl) {
  const [state, setState, thenable] = useAssetState<T, AssetUrl>(urls, isLoaded, load, resolve);

  useEffect(() => {
    thenable
      .then(data => setState({status: 'loaded', isLoaded: true, error: null, data}))
      .catch(error => setState({status: 'error', isLoaded: false, error, data: null}));
  }, [setState, thenable]);

  return state;
}
