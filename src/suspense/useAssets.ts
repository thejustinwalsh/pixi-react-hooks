import {use} from 'react';
import {useAssetCache} from '../hooks/useAssetCache';
import {isLoaded, load, resolve} from '../utils';

import type {UnresolvedAsset} from 'pixi.js';
import type {AssetUrl} from '../types';

export function useAssets<T>(urls: string | UnresolvedAsset): T;
export function useAssets<T>(urls: string[] | UnresolvedAsset[]): Record<string, T>;

export function useAssets<T>(urls: AssetUrl) {
  const {cache} = useAssetCache<T, AssetUrl>({urls, isLoaded, load, resolve});
  return cache.isLoaded ? cache.data : use(cache.promise!);
}
