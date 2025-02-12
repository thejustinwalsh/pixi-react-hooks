import {use, useState} from 'react';
import {Assets} from 'pixi.js';

import type {AssetsManifest} from 'pixi.js';

export function useAssetManifest(
  manifest: AssetsManifest,
  bundles: string[] = [],
  options: Omit<Parameters<typeof Assets.init>[0], 'manifest'> = {},
) {
  const [thenable] = useState<Promise<void> | undefined>(() =>
    Assets.init({...options, manifest}).then(() =>
      Assets.backgroundLoadBundle(
        bundles.length > 0 ? bundles : manifest.bundles.map(bundle => bundle.name),
      ),
    ),
  );

  return use(thenable);
}
