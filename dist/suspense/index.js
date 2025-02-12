import {
  isBundleLoaded,
  isLoaded,
  resolve,
  resolveBundle,
  useAssetState
} from "../chunk-6RBS27UB.js";

// src/assets/suspense/useAssets.ts
import { use } from "react";
import { Assets } from "pixi.js";
function useAssets(urls) {
  const { state, thenable } = useAssetState(urls, isLoaded, Assets.load, resolve);
  return state.isLoaded ? state.data : use(thenable);
}

// src/assets/suspense/useAssetBundle.ts
import { use as use2 } from "react";
import { Assets as Assets2 } from "pixi.js";
function useAssetBundle(bundles) {
  const { state, thenable } = useAssetState(bundles, isBundleLoaded, Assets2.loadBundle, resolveBundle);
  return state.isLoaded ? state.data : use2(thenable);
}

// src/assets/suspense/useAssetManifest.ts
import { use as use3, useState } from "react";
import { Assets as Assets3 } from "pixi.js";
function useAssetManifest(manifest, bundles = [], options = {}) {
  const [thenable] = useState(
    () => Assets3.init({ ...options, manifest }).then(
      () => Assets3.backgroundLoadBundle(
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