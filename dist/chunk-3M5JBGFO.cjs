"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; } function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/utils/index.ts
var _pixijs = require('pixi.js');
var key = (url) => typeof url === "string" ? url : _optionalChain([(_nullishCoalesce(_nullishCoalesce(url.alias, () => ( url.src)), () => ( ""))), 'optionalAccess', _ => _.toString, 'call', _2 => _2()]);
var createKey = (urls) => new Set(Array.isArray(urls) ? urls.map(key) : [key(urls)]);
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
var _react = require('react'); var _react2 = _interopRequireDefault(_react);


// src/hooks/useAssetCache.ts

var getCacheForType = (resourceType) => _react2.default.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE.A.getCacheForType(
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
  const key2 = _react.useMemo.call(void 0, () => createKey(urls), [urls]);
  const cache = usePromiseCache();
  const [assetState, setAssetState] = _react.useState.call(void 0, () => {
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
  const [state, setState] = _react.useState.call(void 0, () => ({
    thenable: !assetState.isLoaded ? loadFromCache(cache, key2, () => load2(urls)) : null,
    key: key2
  }));
  _react.useEffect.call(void 0, () => {
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









exports.isLoaded = isLoaded; exports.isBundleLoaded = isBundleLoaded; exports.load = load; exports.loadBundle = loadBundle; exports.resolve = resolve; exports.resolveBundle = resolveBundle; exports.useAssetState = useAssetState;
//# sourceMappingURL=chunk-3M5JBGFO.cjs.map