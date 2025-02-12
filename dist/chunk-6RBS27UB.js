// src/assets/utils/index.ts
import { Assets } from "pixi.js";
var key = (url) => {
  var _a;
  return typeof url === "string" ? url : (_a = url.alias ?? url.src ?? "") == null ? void 0 : _a.toString();
};
var createKey = (urls) => new Set(Array.isArray(urls) ? urls.map(key) : key(urls));
var didKeyChange = (urls, keys) => Array.isArray(urls) ? !urls.every((url) => keys.has(key(url))) : !keys.has(key(urls));
var isLoaded = (urls) => Array.isArray(urls) ? urls.every((url) => Assets.cache.has(key(url))) : Assets.cache.has(key(urls));
var isBundleLoaded = (bundles) => Array.isArray(bundles) ? bundles.every((bundle) => Assets.resolver.hasBundle(bundle)) : Assets.resolver.hasBundle(bundles);
var resolve = (urls) => Array.isArray(urls) ? urls.reduce((acc, url) => {
  const k = key(url);
  if (Assets.cache.has(k)) acc[k] = Assets.cache.get(k);
  return acc;
}, {}) : Assets.cache.get(key(urls));
var resolveBundle = (bundles) => Assets.resolver.resolveBundle(bundles);

// src/assets/hooks/useAssetState.ts
import { useEffect, useState } from "react";
function useAssetState(urls, isLoaded2, load, resolve2) {
  const [assetState, setAssetState] = useState(() => ({
    isLoaded: isLoaded2(urls),
    error: null,
    data: resolve2(urls)
  }));
  const [state, setState] = useState(() => ({
    thenable: !assetState.isLoaded ? load(urls) : void 0,
    key: createKey(urls)
  }));
  useEffect(() => {
    if (didKeyChange(urls, state.key)) {
      const assetsLoaded = isLoaded2(urls);
      setState((state2) => ({
        thenable: assetsLoaded ? state2.thenable : load(urls),
        key: createKey(urls)
      }));
      setAssetState({ isLoaded: assetsLoaded, error: null, data: resolve2(urls) });
    }
  }, [urls, state.key]);
  return { state: assetState, setState: setAssetState, thenable: state.thenable };
}

export {
  isLoaded,
  isBundleLoaded,
  resolve,
  resolveBundle,
  useAssetState
};
//# sourceMappingURL=chunk-6RBS27UB.js.map