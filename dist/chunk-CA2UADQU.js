// src/utils/index.ts
import { Assets } from "pixi.js";
var key = (url) => typeof url === "string" ? url : (url.alias ?? url.src ?? "")?.toString();
var createKey = (urls) => new Set(Array.isArray(urls) ? urls.map(key) : [key(urls)]);
var hashKey = (key2) => {
  return Array.from(key2).sort().join("|");
};
var isLoaded = (urls) => Array.isArray(urls) ? urls.every((url) => Assets.cache.has(key(url))) : Assets.cache.has(key(urls));
var isBundleLoaded = (bundles) => Array.isArray(bundles) ? bundles.every((bundle) => Assets.resolver.hasBundle(bundle)) : Assets.resolver.hasBundle(bundles);
var load = (urls) => Assets.load(urls);
var loadBundle = (bundles) => Assets.loadBundle(bundles);
var resolve = (urls) => Array.isArray(urls) ? urls.reduce((acc, url) => {
  const k = key(url);
  if (Assets.cache.has(k)) acc[k] = Assets.cache.get(k);
  return acc;
}, {}) : Assets.cache.get(key(urls));
var resolveBundle = (bundles) => {
  const bundleArray = Array.isArray(bundles) ? bundles : [bundles];
  return bundleArray.reduce((acc, bundle) => {
    const assetMap = Assets.resolver.resolveBundle(bundle);
    const assets = Object.keys(assetMap).reduce((acc2, asset) => {
      const k = key(asset);
      if (Assets.cache.has(k)) acc2[k] = Assets.cache.get(k);
      return acc2;
    }, {});
    return { ...acc, ...assets };
  }, {});
};
var remove = (urls) => {
  if (urls) {
    Array.isArray(urls) ? urls.forEach((url) => Assets.cache.remove(key(url))) : Assets.cache.remove(key(urls));
  } else {
    Assets.cache.reset();
  }
};

// src/hooks/useAssetCache.ts
import { useEffect, useMemo } from "react";
import { useStore, createStore } from "react-concurrent-store";
function loadFromCache(cache, { urls, isLoaded: isLoaded2, load: load2, resolve: resolve2 }) {
  const key2 = createKey(urls);
  const hash = hashKey(key2);
  const cached = cache.get(hash);
  if (cached) {
    return { hash, cached };
  }
  const loaded = isLoaded2(urls);
  const data = loaded ? resolve2(urls) : null;
  const promise = loaded ? Promise.resolve(data) : load2(urls).finally(
    () => store.update({
      type: "set",
      payload: {
        key: key2,
        data,
        promise,
        hash
      }
    })
  );
  return { hash, cached: { key: key2, data, promise, hash } };
}
var storeReducer = (current, action) => {
  switch (action.type) {
    case "update": {
      return new Map(current).set(action.payload.hash, action.payload);
    }
    case "remove": {
      remove(action.payload.urls);
      const key2 = createKey(action.payload.urls);
      const hash = hashKey(key2);
      current.delete(hash);
      return new Map(current);
    }
    // set: Direct cache mutation, skip re-render
    case "set": {
      return current.set(action.payload.hash, action.payload);
    }
    // reset: Direct cache clear, then trigger a re-render
    case "reset": {
      if (action.payload) {
        remove();
      }
      current.clear();
      return new Map(current);
    }
  }
};
var store = createStore(/* @__PURE__ */ new Map(), storeReducer);
function useAssetCache({
  urls,
  isLoaded: isLoaded2,
  load: load2,
  resolve: resolve2
}) {
  const cache = useStore(store);
  const current = useMemo(() => {
    return loadFromCache(cache, { urls, isLoaded: isLoaded2, load: load2, resolve: resolve2 });
  }, [cache, urls, isLoaded2, load2, resolve2]);
  const cached = useMemo(() => cache.get(current.hash) ?? null, [cache, current.hash]);
  useEffect(() => {
    if (!cached) {
      store.update({
        type: "update",
        payload: current.cached
      });
    }
  }, [cached, current.cached]);
  return cached ?? current.cached;
}

// src/hooks/useWarnOnRemount.ts
import { useEffect as useEffect2 } from "react";
var noop = (_hook) => {
};
var useWarnOnRemount = (
  // @ts-ignore -- dev only
  process.env.NODE_ENV === "production" ? noop : (hook) => {
    useEffect2(() => {
      if (hook.hasMountedTag === console.log.name) {
        console.warn(`${hook.name} should only be mounted once during the lifetime of the app`);
      } else if (hook.hasMountedTag === void 0) {
        hook.hasMountedTag = console.log.name;
      }
    }, []);
  }
);

export {
  isLoaded,
  isBundleLoaded,
  load,
  loadBundle,
  resolve,
  resolveBundle,
  useAssetCache,
  useWarnOnRemount
};
//# sourceMappingURL=chunk-CA2UADQU.js.map