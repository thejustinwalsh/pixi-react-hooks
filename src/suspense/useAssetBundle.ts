import {use} from 'react';
import {useAssetState} from '../hooks/useAssetState';
import {isBundleLoaded, loadBundle, resolveBundle} from '../utils';

import type {AssetBundle} from '../types';

export function useAssetBundle<T>(bundles: string | string[]) {
  const [state, _, thenable] = useAssetState<AssetBundle<T>, string | string[]>(
    bundles,
    isBundleLoaded,
    loadBundle,
    resolveBundle,
  );

  return state.isLoaded ? state.data : use(thenable);
}
