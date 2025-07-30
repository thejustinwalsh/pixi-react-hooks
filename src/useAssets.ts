import {useEffect, useState} from 'react';
import {isLoaded, load, resolve} from './utils';

import type {UnresolvedAsset} from 'pixi.js';
import type {AssetState, AssetUrl} from './types';
import {useAssetCache} from './useAssetCache';

export function useAssets<T>(urls: string | UnresolvedAsset): AssetState<T | undefined>;
export function useAssets<T>(urls: string[] | UnresolvedAsset[]): AssetState<Record<string, T>>;

export function useAssets<T>(urls: AssetUrl) {
  const {cache} = useAssetCache<T, AssetUrl>({urls, isLoaded, load, resolve});
  const [state, setState] = useState<AssetState<T | Record<string, T>>>({
    status: 'pending',
    isLoaded: false,
    error: null,
    data: null,
  });

  useEffect(() => {
    if (!cache.isLoaded) {
      cache
        .promise!.then(data => {
          setState({
            status: 'loaded',
            data,
            error: null,
          });
        })
        .catch(error => {
          setState({
            status: 'error',
            data: null,
            error,
          });
        });
    }
  }, [cache]);

  return state;
}
