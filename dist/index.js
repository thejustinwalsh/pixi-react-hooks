import {
  isBundleLoaded,
  isLoaded,
  load,
  loadBundle,
  resolve,
  resolveBundle,
  useAssetState
} from "./chunk-XNPG33CZ.js";

// src/useAssets.ts
import { useEffect } from "react";
function useAssets(urls) {
  const [state, setState, thenable] = useAssetState(urls, isLoaded, load, resolve);
  useEffect(() => {
    thenable?.then((data) => setState({ status: "loaded", isLoaded: true, error: null, data })).catch((error) => setState({ status: "error", isLoaded: false, error, data: null }));
  }, [setState, thenable]);
  return state;
}

// src/useAssetBundle.ts
import { useEffect as useEffect2 } from "react";
function useAssetBundle(bundles) {
  const [state, setState, thenable] = useAssetState(
    bundles,
    isBundleLoaded,
    loadBundle,
    resolveBundle
  );
  useEffect2(() => {
    thenable?.then((data) => setState({ status: "loaded", isLoaded: true, error: null, data })).catch((error) => setState({ status: "error", isLoaded: false, error, data: null }));
  }, [setState, thenable]);
  return state;
}

// src/useAssetManifest.ts
import { Assets } from "pixi.js";
import { useEffect as useEffect3, useState } from "react";
function useAssetManifest(manifest, bundles = [], options = {}) {
  const [{ isLoaded: isLoaded2, thenable }, setState] = useState(() => ({
    isLoaded: false,
    thenable: Assets.init({
      ...options,
      manifest
    }).then(() => {
      Assets.backgroundLoadBundle(
        bundles.length > 0 ? bundles : manifest.bundles.map((bundle) => bundle.name)
      );
    })
  }));
  useEffect3(() => {
    thenable.then(() => setState((s) => ({ ...s, isLoaded: true })));
  }, [thenable]);
  return { isLoaded: isLoaded2 };
}
export {
  useAssetBundle,
  useAssetManifest,
  useAssets
};
//# sourceMappingURL=index.js.map