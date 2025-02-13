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
import { useMemo } from "react";
import { useEffect, useState } from "react";

// src/hooks/useAssetCache.ts
import React, { useCallback, useTransition } from "react";
var getCacheForType = (resourceType) => React.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.A.getCacheForType(
  resourceType
);
var createPromiseCache = () => /* @__PURE__ */ new Map();
function loadFromCache(cache, key2, load2) {
  const cacheKey = Array.from(key2).join("|");
  let promise = cache.get(cacheKey);
  if (!promise) {
    promise = load2();
    cache.set(cacheKey, promise);
  }
  return promise;
}
function usePromiseCache() {
  return getCacheForType(createPromiseCache);
}

// src/hooks/useAssetState.ts
function useAssetState(urls, isLoaded2, load2, resolve2) {
  const key2 = useMemo(() => createKey(urls), [urls]);
  const cache = usePromiseCache();
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
  const [state, setState] = useState(() => ({
    thenable: !assetState.isLoaded ? loadFromCache(cache, key2, () => load2(urls)) : null,
    key: key2
  }));
  useEffect(() => {
    if (didKeyChange(urls, state.key)) {
      if (isLoaded2(urls)) {
        setAssetState({ status: "loaded", isLoaded: true, error: null, data: resolve2(urls) });
        setState((state2) => ({ ...state2, key: key2 }));
      } else {
        setState({ thenable: loadFromCache(cache, key2, () => load2(urls)), key: key2 });
        setAssetState({ status: "pending", isLoaded: false, error: null, data: null });
      }
    }
  }, [cache, isLoaded2, key2, load2, resolve2, state.key, urls]);
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
//# sourceMappingURL=chunk-EW4XQNLC.js.map