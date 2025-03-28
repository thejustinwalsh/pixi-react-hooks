import {Assets, AssetsManifest} from 'pixi.js';
import {useEffect, useState} from 'react';
import {useWarnOnRemount} from './hooks/useWarnOnRemount';

type AssetManifestState = {
  isLoaded: boolean;
  thenable: Promise<void>;
};

export function useAssetManifest(
  manifest: AssetsManifest,
  bundles: string[] = [],
  options: Omit<Parameters<typeof Assets.init>[0], 'manifest'> = {},
) {
  useWarnOnRemount(useAssetManifest);
  const [{isLoaded, thenable}, setState] = useState<AssetManifestState>(() => ({
    isLoaded: false,
    thenable: Assets.init({
      ...options,
      manifest,
    }).then(() => {
      Assets.backgroundLoadBundle(
        bundles.length > 0 ? bundles : manifest.bundles.map(bundle => bundle.name),
      );
    }),
  }));

  useEffect(() => {
    thenable.then(() => setState(s => ({...s, isLoaded: true})));
  }, [thenable]);

  return {isLoaded};
}
