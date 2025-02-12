import {use} from 'react';
import {Assets} from 'pixi.js';
import {useAssetState} from '../hooks/useAssetState';
import {isBundleLoaded, resolveBundle} from '../utils';

import type {ResolvedAsset} from 'pixi.js';

export function useAssetBundle(bundles: string | string[]) {
  const [state, _, thenable] = useAssetState<
    Record<string, ResolvedAsset> | Record<string, Record<string, ResolvedAsset>>
  >(bundles, isBundleLoaded, Assets.loadBundle, resolveBundle);

  return state.isLoaded ? state.data : use(thenable);
}
