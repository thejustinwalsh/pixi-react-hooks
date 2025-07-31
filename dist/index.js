import {
  isBundleLoaded,
  isLoaded,
  load,
  loadBundle,
  resolve,
  resolveBundle,
  useAssetCache,
  useWarnOnRemount
} from "./chunk-CA2UADQU.js";

// src/useAssets.ts
import { useEffect, useRef, useState } from "react";
function useAssets(urls) {
  const cache = useAssetCache({ urls, isLoaded, load, resolve });
  const sync = useRef(/* @__PURE__ */ new WeakSet());
  const [state, setState] = useState(() => ({
    data: cache.data,
    error: null
  }));
  useEffect(() => {
    if (cache.data === null && !sync.current.has(cache.promise)) {
      cache.promise.then((data) => {
        if (sync.current.has(cache.promise)) {
          setState({
            data,
            error: null
          });
        }
        return data;
      }).catch((error) => {
        if (sync.current.has(cache.promise)) {
          setState({
            data: null,
            error
          });
        }
      });
    }
    sync.current = new WeakSet([cache.promise]);
  }, [cache.promise, cache.data]);
  if (state.error) {
    return {
      status: "error",
      isLoaded: false,
      data: null,
      error: state.error
    };
  }
  if (state.data) {
    return {
      status: "loaded",
      isLoaded: true,
      data: state.data,
      error: null
    };
  }
  return {
    status: "pending",
    isLoaded: false,
    data: null,
    error: null
  };
}

// src/useAssetBundle.ts
import { useEffect as useEffect2, useRef as useRef2, useState as useState2 } from "react";
function useAssetBundle(bundles) {
  const cache = useAssetCache({
    urls: bundles,
    isLoaded: isBundleLoaded,
    load: loadBundle,
    resolve: resolveBundle
  });
  const sync = useRef2(/* @__PURE__ */ new WeakSet());
  const [state, setState] = useState2(() => ({
    data: cache.data,
    error: null
  }));
  useEffect2(() => {
    if (cache.data === null && !sync.current.has(cache.promise)) {
      cache.promise.then((data) => {
        if (sync.current.has(cache.promise)) {
          setState({
            data,
            error: null
          });
        }
        return data;
      }).catch((error) => {
        if (sync.current.has(cache.promise)) {
          setState({
            data: null,
            error
          });
        }
      });
    }
    sync.current = new WeakSet([cache.promise]);
  }, [cache.promise, cache.data]);
  if (state.error) {
    return {
      status: "error",
      isLoaded: false,
      data: null,
      error: state.error
    };
  }
  if (state.data) {
    return {
      status: "loaded",
      isLoaded: true,
      data: state.data,
      error: null
    };
  }
  return {
    status: "pending",
    isLoaded: false,
    data: null,
    error: null
  };
}

// src/useAssetManifest.ts
import { Assets } from "pixi.js";
import { useEffect as useEffect3, useState as useState3 } from "react";
function useAssetManifest(manifest, bundles = [], options = {}) {
  useWarnOnRemount(useAssetManifest);
  const [{ isLoaded: isLoaded2, thenable }, setState] = useState3(() => ({
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