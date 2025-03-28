import {use, useState} from 'react';
import {Assets} from 'pixi.js';

import type {AssetsManifest} from 'pixi.js';
import {useWarnOnRemount} from '../hooks/useWarnOnRemount';

export function useAssetManifest(
  manifest: AssetsManifest,
  bundles: string[] = [],
  options: Omit<Parameters<typeof Assets.init>[0], 'manifest'> = {},
) {
  useWarnOnRemount(useAssetManifest);
  const [thenable] = useState<Promise<void>>(() =>
    Assets.init({...options, manifest}).then(() =>
      Assets.backgroundLoadBundle(
        bundles.length > 0 ? bundles : manifest.bundles.map(bundle => bundle.name),
      ),
    ),
  );

  return use(thenable);
}
