// src/useAssets.ts
import { use, useEffect, useState } from "react";
import { Assets } from "pixi.js";
function useAssets(urls) {
  const [assetState, setAssetState] = useState(() => ({
    isLoaded: isLoaded(urls),
    error: null,
    data: resolve(urls)
  }));
  const [state, setState] = useState(() => ({
    thenable: !assetState.isLoaded ? Assets.load(urls) : void 0,
    key: createKey(urls)
  }));
  useEffect(() => {
    if (didKeyChange(urls, state.key)) {
      const assetsLoaded = isLoaded(urls);
      setState((state2) => ({ thenable: assetsLoaded ? state2.thenable : Assets.load(urls), key: createKey(urls) }));
      setAssetState({ isLoaded: assetsLoaded, error: null, data: resolve(urls) });
    }
  }, [urls, state.key]);
  useEffect(() => {
    var _a;
    (_a = state.thenable) == null ? void 0 : _a.then((data) => setAssetState({ isLoaded: true, error: null, data })).catch((error) => setAssetState({ isLoaded: true, error, data: void 0 }));
  }, [state.thenable]);
  return assetState;
}
function useSuspenseAssets(urls) {
  const [state, setState] = useState(() => ({
    thenable: Assets.load(urls),
    key: createKey(urls)
  }));
  useEffect(() => {
    if (didKeyChange(urls, state.key)) {
      setState({ thenable: Assets.load(urls), key: createKey(urls) });
    }
  }, [urls, state]);
  return use(state.thenable);
}
var key = (url) => {
  var _a;
  return typeof url === "string" ? url : (_a = url.alias ?? url.src ?? "") == null ? void 0 : _a.toString();
};
var createKey = (urls) => new Set(Array.isArray(urls) ? urls.map(key) : key(urls));
var didKeyChange = (urls, keys) => Array.isArray(urls) ? !urls.every((url) => keys.has(key(url))) : !keys.has(key(urls));
var isLoaded = (urls) => Array.isArray(urls) ? urls.every((url) => Assets.cache.has(key(url))) : Assets.cache.has(key(urls));
var resolve = (urls) => Array.isArray(urls) ? urls.reduce(
  (acc, url) => {
    const k = key(url);
    if (Assets.cache.has(k)) acc[k] = Assets.cache.get(k);
    return acc;
  },
  {}
) : Assets.cache.get(key(urls));
export {
  useAssets,
  useSuspenseAssets
};
//# sourceMappingURL=useAssets.js.map