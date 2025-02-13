import {
  isBundleLoaded,
  isLoaded,
  load,
  loadBundle,
  resolve,
  resolveBundle,
  useAssetState
} from "../chunk-EWP2LBVQ.js";

// src/suspense/useAssets.ts
import { use } from "react";
function useAssets(urls) {
  const [state, _, thenable] = useAssetState(urls, isLoaded, load, resolve);
  return state.isLoaded ? state.data : use(thenable);
}

// src/suspense/useAssetBundle.ts
import { use as use2 } from "react";
function useAssetBundle(bundles) {
  const [state, _, thenable] = useAssetState(
    bundles,
    isBundleLoaded,
    loadBundle,
    resolveBundle
  );
  return state.isLoaded ? state.data : use2(thenable);
}

// src/suspense/useAssetManifest.ts
import { use as use3, useState } from "react";
import { Assets } from "pixi.js";
function useAssetManifest(manifest, bundles = [], options = {}) {
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