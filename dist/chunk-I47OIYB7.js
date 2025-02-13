// src/utils/index.ts
import { Assets } from "pixi.js";
var key = (url) => typeof url === "string" ? url : (url.alias ?? url.src ?? "")?.toString();
var createKey = (urls) => new Set(Array.isArray(urls) ? urls.map(key) : [key(urls)]);
var didKeyChange = (urls, keys) => Array.isArray(urls) ? !urls.every((url) => keys.has(key(url))) : !keys.has(key(urls));
var isLoaded = (urls) => Array.isArray(urls) ? urls.every((url) => Assets.cache.has(key(url))) : Assets.cache.has(key(urls));
var isBundleLoaded = (bundles) => Array.isArray(bundles) ? bundles.every((bundle) => Assets.resolver.hasBundle(bundle)) : Assets.resolver.hasBundle(bundles);
var load = (urls) => Assets.load(urls);
var loadBundle = (bundles) => Assets.loadBundle(bundles);
var resolve = (urls) => Array.isArray(urls) ? urls.reduce((acc, url) => {
  const k = key(url);
  if (Assets.cache.has(k)) acc[k] = Assets.cache.get(k);
  return acc;
}, {}) : Assets.cache.get(key(urls));
var resolveBundle = (bundles) => Assets.resolver.resolveBundle(bundles);

// src/hooks/useAssetState.ts
import React from "react";
import { useEffect, useState } from "react";
var getCacheForType = (resourceType) => React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.A.getCacheForType(
  resourceType
);
var createPromiseCache = () => /* @__PURE__ */ new Map();
var getPromiseCache = () => getCacheForType(createPromiseCache);
function loadFromCache(key2, load2) {
  const cache = getPromiseCache();
  const cacheKey = Array.from(key2).join("|");
  let promise = cache.get(cacheKey);
  if (!promise) promise = load2();
  cache.set(cacheKey, promise);
  return promise;
}
function useAssetState(urls, isLoaded2, load2, resolve2) {
  const [assetState, setAssetState] = useState(() => {
    const loaded = isLoaded2(urls);
    return loaded ? {
      status: "loaded",
      isLoaded: true,
      error: null,
      data: resolve2(urls)
    } : {
      status: "pending",
      isLoaded: false,
      error: null,
      data: null
    };
  });
  const [state, setState] = useState(() => {
    const key2 = createKey(urls);
    return {
      thenable: !assetState.isLoaded ? loadFromCache(key2, () => load2(urls)) : null,
      key: key2
    };
  });
  useEffect(() => {
    if (didKeyChange(urls, state.key)) {
      const assetsLoaded = isLoaded2(urls);
      setState((state2) => ({
        thenable: assetsLoaded ? state2.thenable : load2(urls),
        key: createKey(urls)
      }));
      setAssetState(
        assetsLoaded ? { status: "loaded", isLoaded: true, error: null, data: resolve2(urls) } : { status: "pending", isLoaded: false, error: null, data: null }
      );
    }
  }, [urls, state.key, isLoaded2, resolve2, load2]);
  if (assetState.status === "error") {
    return [assetState, setAssetState, state.thenable];
  }
  if (assetState.status === "pending") {
    return [assetState, setAssetState, state.thenable];
  }
  return [assetState, setAssetState, state.thenable];
}

export {
  isLoaded,
  isBundleLoaded,
  load,
  loadBundle,
  resolve,
  resolveBundle,
  useAssetState
};
//# sourceMappingURL=chunk-I47OIYB7.js.map