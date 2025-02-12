import {use} from 'react';
import {useAssetState} from '../hooks/useAssetState';

import {Assets, type UnresolvedAsset} from 'pixi.js';
import {isLoaded, resolve} from '../utils';

export function useAssets<T>(urls: string | UnresolvedAsset): T;
export function useAssets<T>(urls: string[] | UnresolvedAsset[]): Record<string, T>;

export function useAssets<T>(urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) {
  const [state, _, thenable] = useAssetState<T>(urls, isLoaded, Assets.load, resolve);

  return state.isLoaded ? state.data : use(thenable);
}
