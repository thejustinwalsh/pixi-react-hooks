import {
  isBundleLoaded,
  isLoaded,
  load,
  loadBundle,
  resolve,
  resolveBundle,
  useAssetCache,
  useWarnOnRemount
} from "../chunk-CA2UADQU.js";

// src/suspense/useAssets.ts
import { use } from "react";
function useAssets(urls) {
  const cache = useAssetCache({ urls, isLoaded, load, resolve });
  return use(cache.promise);
}

// src/suspense/useAssetBundle.ts
import { use as use2 } from "react";
function useAssetBundle(bundles) {
  const cache = useAssetCache({
    urls: bundles,
    isLoaded: isBundleLoaded,
    load: loadBundle,
    resolve: resolveBundle
  });
  return use2(cache.promise);
}

// src/suspense/useAssetManifest.ts
import { use as use3, useState } from "react";
import { Assets } from "pixi.js";
function useAssetManifest(manifest, bundles = [], options = {}) {
  useWarnOnRemount(useAssetManifest);
  const [thenable] = useState(
    () => Assets.init({ ...options, manifest }).then(
      () => Assets.backgroundLoadBundle(
        bundles.length > 0 ? bundles : manifest.bundles.map((bundle) => bundle.name)
      )
    )
  );
  return use3(thenable);
}
export {
  useAssetBundle,
  useAssetManifest,
  useAssets
};
//# sourceMappingURL=index.js.map