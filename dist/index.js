import {
  isBundleLoaded,
  isLoaded,
  resolve,
  resolveBundle,
  useAssetState
} from "./chunk-6RBS27UB.js";

// src/assets/useAssets.ts
import { useEffect } from "react";
import { Assets } from "pixi.js";
function useAssets(urls) {
  const { state, setState, thenable } = useAssetState(urls, isLoaded, Assets.load, resolve);
  useEffect(() => {
    thenable == null ? void 0 : thenable.then((data) => setState({ isLoaded: true, error: null, data })).catch((error) => setState({ isLoaded: true, error, data: void 0 }));
  }, [thenable]);
  return state;
}

// src/assets/useAssetBundle.ts
import { useEffect as useEffect2 } from "react";
import { Assets as Assets2 } from "pixi.js";
function useAssetBundle(bundles) {
  const { state, setState, thenable } = useAssetState(bundles, isBundleLoaded, Assets2.loadBundle, resolveBundle);
  useEffect2(() => {
    thenable == null ? void 0 : thenable.then((data) => setState({ isLoaded: true, error: null, data })).catch((error) => setState({ isLoaded: true, error, data: void 0 }));
  }, [thenable]);
  return state;
}

// src/assets/useAssetManifest.ts
import { Assets as Assets3 } from "pixi.js";
import { useEffect as useEffect3, useState as useState2 } from "react";
var manifestSingleton = null;
function useAssetManifest(manifest, bundles = [], options = {}) {
  const [isLoaded2, setIsLoaded] = useState2(false);
  useEffect3(() => {
    (async () => {
      await Assets3.init({
        ...options,
        manifest
      });
      Assets3.backgroundLoadBundle(
        bundles.length > 0 ? bundles : manifest.bundles.map((bundle) => bundle.name)
      );
      setIsLoaded(true);
    })();
  }, []);
  if (manifestSingleton !== null && manifestSingleton !== manifest) {
    console.warn("useAssetManifest should only be used once in your app");
  }
  manifestSingleton = manifest;
  return { isLoaded: isLoaded2 };
}
export {
  useAssetBundle,
  useAssetManifest,
  useAssets
};
//# sourceMappingURL=index.js.map