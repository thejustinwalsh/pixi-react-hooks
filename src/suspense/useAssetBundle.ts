import {use} from 'react';
import {useAssetState} from '../hooks/useAssetState';
import {isBundleLoaded, loadBundle, resolveBundle} from '../utils';

import type {AssetState} from '../types';

export function useAssetBundle<T extends Record<string, unknown>>(
  bundles: string | string[],
): AssetState<T> {
  const [state, _, thenable] = useAssetState<AssetState<T>, string | string[]>(
    bundles,
    isBundleLoaded,
    loadBundle,
    resolveBundle,
  );

  return state.isLoaded ? state.data : use(thenable);
}
