import {use} from 'react';
import {useAssetState} from '../hooks/useAssetState';
import {isLoaded, load, resolve} from '../utils';

import type {UnresolvedAsset} from 'pixi.js';

export function useAssets<T>(urls: string | UnresolvedAsset): T;
export function useAssets<T>(urls: string[] | UnresolvedAsset[]): Record<string, T>;

export function useAssets<T>(urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) {
  const [state, _, thenable] = useAssetState<T>(urls, isLoaded, load, resolve);

  return state.isLoaded ? state.data : use(thenable);
}
