import {useEffect} from 'react';
import {useAssetState} from './hooks/useAssetState';
import {isBundleLoaded, loadBundle, resolveBundle} from './utils';

import type {AssetState} from './types';

export function useAssetBundle<T extends Record<string, unknown>>(
  bundles: string | string[],
): AssetState<T> {
  const [state, setState, thenable] = useAssetState<T, string | string[]>(
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
