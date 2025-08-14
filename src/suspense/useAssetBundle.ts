import {use} from 'react';
import {useAssetCache} from '../hooks/useAssetCache';
import {isBundleLoaded, loadBundle, resolveBundle} from '../utils';

import type {AssetState} from '../types';

export function useAssetBundle<T extends Record<string, unknown>>(
  bundles: string | string[],
): AssetState<T> {
  const cache = useAssetCache<AssetState<T>, string | string[]>({
    urls: bundles,
    isLoaded: isBundleLoaded,
    load: loadBundle,
    resolve: resolveBundle,
  });
  return use(cache.promise);
}
