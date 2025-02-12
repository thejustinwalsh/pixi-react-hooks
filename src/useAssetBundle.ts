import {useEffect} from 'react';
import {useAssetState} from './hooks/useAssetState';
import {isBundleLoaded, loadBundle, resolveBundle} from './utils';

import type {ResolvedAsset} from 'pixi.js';
import type {AssetState} from './types';

export function useAssetBundle(bundles: string): AssetState<Record<string, ResolvedAsset>>;
export function useAssetBundle(
  bundles: string[],
): AssetState<Record<string, Record<string, ResolvedAsset>>>;

export function useAssetBundle(bundles: string | string[]) {
  const [state, setState, thenable] = useAssetState<
    Record<string, ResolvedAsset> | Record<string, Record<string, ResolvedAsset>>
  >(bundles, isBundleLoaded, loadBundle, resolveBundle);

  useEffect(() => {
    thenable
      ?.then(data => setState({isLoaded: true, error: null, data}))
      .catch(error => setState({isLoaded: true, error, data: undefined}));
  }, [setState, thenable]);

  return state;
}
