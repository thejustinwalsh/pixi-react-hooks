"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } }// src/utils/index.ts
var _pixijs = require('pixi.js');
var key = (url) => {
  var _a;
  return typeof url === "string" ? url : (_a = _nullishCoalesce(_nullishCoalesce(url.alias, () => ( url.src)), () => ( ""))) == null ? void 0 : _a.toString();
};
var createKey = (urls) => new Set(Array.isArray(urls) ? urls.map(key) : key(urls));
var didKeyChange = (urls, keys) => Array.isArray(urls) ? !urls.every((url) => keys.has(key(url))) : !keys.has(key(urls));
var isLoaded = (urls) => Array.isArray(urls) ? urls.every((url) => _pixijs.Assets.cache.has(key(url))) : _pixijs.Assets.cache.has(key(urls));
var isBundleLoaded = (bundles) => Array.isArray(bundles) ? bundles.every((bundle) => _pixijs.Assets.resolver.hasBundle(bundle)) : _pixijs.Assets.resolver.hasBundle(bundles);
var load = (urls) => _pixijs.Assets.load(urls);
var loadBundle = (bundles) => _pixijs.Assets.loadBundle(bundles);
var resolve = (urls) => Array.isArray(urls) ? urls.reduce((acc, url) => {
  const k = key(url);
  if (_pixijs.Assets.cache.has(k)) acc[k] = _pixijs.Assets.cache.get(k);
  return acc;
}, {}) : _pixijs.Assets.cache.get(key(urls));
var resolveBundle = (bundles) => _pixijs.Assets.resolver.resolveBundle(bundles);

// src/hooks/useAssetState.ts
var _react = require('react');
function useAssetState(urls, isLoaded2, load2, resolve2) {
  const [assetState, setAssetState] = _react.useState.call(void 0, () => ({
    isLoaded: isLoaded2(urls),
    error: null,
    data: resolve2(urls)
  }));
  const [state, setState] = _react.useState.call(void 0, () => ({
    thenable: !assetState.isLoaded ? load2(urls) : void 0,
    key: createKey(urls)
  }));
  _react.useEffect.call(void 0, () => {
    if (didKeyChange(urls, state.key)) {
      const assetsLoaded = isLoaded2(urls);
      setState((state2) => ({
        thenable: assetsLoaded ? state2.thenable : load2(urls),
        key: createKey(urls)
      }));
      setAssetState({ isLoaded: assetsLoaded, error: null, data: resolve2(urls) });
    }
  }, [urls, state.key, isLoaded2, resolve2, load2]);
  return [assetState, setAssetState, state.thenable];
}









exports.isLoaded = isLoaded; exports.isBundleLoaded = isBundleLoaded; exports.load = load; exports.loadBundle = loadBundle; exports.resolve = resolve; exports.resolveBundle = resolveBundle; exports.useAssetState = useAssetState;
//# sourceMappingURL=chunk-Y6YBMKNJ.cjs.map