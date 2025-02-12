import {Usable, use} from 'react';
import {useAssetState} from '../hooks/useAssetState';
import {isBundleLoaded, loadBundle, resolveBundle} from '../utils';

import type {ResolvedAsset} from 'pixi.js';

export function useAssetBundle(bundles: string | string[]) {
  const [state, _, thenable] = useAssetState<
    Record<string, ResolvedAsset> | Record<string, Record<string, ResolvedAsset>>
  >(bundles, isBundleLoaded, loadBundle, resolveBundle);

  return state.isLoaded
    ? state.data
    : use(
        thenable as Usable<
          Record<string, ResolvedAsset> | Record<string, Record<string, ResolvedAsset>>
        >,
      ); // TODO: Ensure Promise or null based on state.isLoaded
}
