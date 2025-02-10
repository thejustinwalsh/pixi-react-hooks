var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key2 of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key2) && key2 !== except)
        __defProp(to, key2, { get: () => from[key2], enumerable: !(desc = __getOwnPropDesc(from, key2)) || desc.enumerable });
  }
  return to;
};
var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

// src/useAssets.ts
var useAssets_exports = {};
__export(useAssets_exports, {
  useAssets: () => useAssets,
  useSuspenseAssets: () => useSuspenseAssets
});
module.exports = __toCommonJS(useAssets_exports);
var import_react = require("react");
var import_pixi = require("pixi.js");
function useAssets(urls) {
  const [assetState, setAssetState] = (0, import_react.useState)(() => ({
    isLoaded: isLoaded(urls),
    error: null,
    data: resolve(urls)
  }));
  const [state, setState] = (0, import_react.useState)(() => ({
    thenable: !assetState.isLoaded ? import_pixi.Assets.load(urls) : void 0,
    key: createKey(urls)
  }));
  (0, import_react.useEffect)(() => {
    if (didKeyChange(urls, state.key)) {
      const assetsLoaded = isLoaded(urls);
      setState((state2) => ({ thenable: assetsLoaded ? state2.thenable : import_pixi.Assets.load(urls), key: createKey(urls) }));
      setAssetState({ isLoaded: assetsLoaded, error: null, data: resolve(urls) });
    }
  }, [urls, state.key]);
  (0, import_react.useEffect)(() => {
    var _a;
    (_a = state.thenable) == null ? void 0 : _a.then((data) => setAssetState({ isLoaded: true, error: null, data })).catch((error) => setAssetState({ isLoaded: true, error, data: void 0 }));
  }, [state.thenable]);
  return assetState;
}
function useSuspenseAssets(urls) {
  const [state, setState] = (0, import_react.useState)(() => ({
    thenable: import_pixi.Assets.load(urls),
    key: createKey(urls)
  }));
  (0, import_react.useEffect)(() => {
    if (didKeyChange(urls, state.key)) {
      setState({ thenable: import_pixi.Assets.load(urls), key: createKey(urls) });
    }
  }, [urls, state]);
  return (0, import_react.use)(state.thenable);
}
var key = (url) => {
  var _a;
  return typeof url === "string" ? url : (_a = url.alias ?? url.src ?? "") == null ? void 0 : _a.toString();
};
var createKey = (urls) => new Set(Array.isArray(urls) ? urls.map(key) : key(urls));
var didKeyChange = (urls, keys) => Array.isArray(urls) ? !urls.every((url) => keys.has(key(url))) : !keys.has(key(urls));
var isLoaded = (urls) => Array.isArray(urls) ? urls.every((url) => import_pixi.Assets.cache.has(key(url))) : import_pixi.Assets.cache.has(key(urls));
var resolve = (urls) => Array.isArray(urls) ? urls.reduce(
  (acc, url) => {
    const k = key(url);
    if (import_pixi.Assets.cache.has(k)) acc[k] = import_pixi.Assets.cache.get(k);
    return acc;
  },
  {}
) : import_pixi.Assets.cache.get(key(urls));
// Annotate the CommonJS export names for ESM import in node:
0 && (module.exports = {
  useAssets,
  useSuspenseAssets
});
//# sourceMappingURL=useAssets.cjs.map