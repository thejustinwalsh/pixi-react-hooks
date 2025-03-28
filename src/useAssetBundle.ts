import {useEffect} from 'react';
import {useAssetState} from './hooks/useAssetState';
import {isBundleLoaded, loadBundle, resolveBundle} from './utils';

import type {ResolvedAsset} from 'pixi.js';
import type {AssetState, AssetBundle} from './types';

export function useAssetBundle(bundles: string): AssetState<Record<string, ResolvedAsset>>;
export function useAssetBundle(
  bundles: string[],
): AssetState<Record<string, Record<string, ResolvedAsset>>>;

export function useAssetBundle<T>(bundles: string | string[]) {
  const [state, setState, thenable] = useAssetState<AssetBundle<T>, string | string[]>(
    bundles,
    isBundleLoaded,
    loadBundle,
    resolveBundle,
  );

  useEffect(() => {
    thenable
      .then(data => setState({status: 'loaded', isLoaded: true, error: null, data}))
      .catch(error => setState({status: 'error', isLoaded: false, error, data: null}));
  }, [setState, thenable]);

  return state;
}
