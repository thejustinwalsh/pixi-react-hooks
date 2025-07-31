"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _nullishCoalesce(lhs, rhsFn) { if (lhs != null) { return lhs; } else { return rhsFn(); } } function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }// src/utils/index.ts
var _pixijs = require('pixi.js');
var key = (url) => typeof url === "string" ? url : _optionalChain([(_nullishCoalesce(_nullishCoalesce(url.alias, () => ( url.src)), () => ( ""))), 'optionalAccess', _ => _.toString, 'call', _2 => _2()]);
var createKey = (urls) => new Set(Array.isArray(urls) ? urls.map(key) : [key(urls)]);
var hashKey = (key2) => {
  return Array.from(key2).sort().join("|");
};
var isLoaded = (urls) => Array.isArray(urls) ? urls.every((url) => _pixijs.Assets.cache.has(key(url))) : _pixijs.Assets.cache.has(key(urls));
var isBundleLoaded = (bundles) => Array.isArray(bundles) ? bundles.every((bundle) => _pixijs.Assets.resolver.hasBundle(bundle)) : _pixijs.Assets.resolver.hasBundle(bundles);
var load = (urls) => _pixijs.Assets.load(urls);
var loadBundle = (bundles) => _pixijs.Assets.loadBundle(bundles);
var resolve = (urls) => Array.isArray(urls) ? urls.reduce((acc, url) => {
  const k = key(url);
  if (_pixijs.Assets.cache.has(k)) acc[k] = _pixijs.Assets.cache.get(k);
  return acc;
}, {}) : _pixijs.Assets.cache.get(key(urls));
var resolveBundle = (bundles) => {
  const bundleArray = Array.isArray(bundles) ? bundles : [bundles];
  return bundleArray.reduce((acc, bundle) => {
    const assetMap = _pixijs.Assets.resolver.resolveBundle(bundle);
    const assets = Object.keys(assetMap).reduce((acc2, asset) => {
      const k = key(asset);
      if (_pixijs.Assets.cache.has(k)) acc2[k] = _pixijs.Assets.cache.get(k);
      return acc2;
    }, {});
    return { ...acc, ...assets };
  }, {});
};
var remove = (urls) => {
  if (urls) {
    Array.isArray(urls) ? urls.forEach((url) => _pixijs.Assets.cache.remove(key(url))) : _pixijs.Assets.cache.remove(key(urls));
  } else {
    _pixijs.Assets.cache.reset();
  }
};

// src/hooks/useAssetCache.ts
var _react = require('react');
var _reactconcurrentstore = require('react-concurrent-store');
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
var store = _reactconcurrentstore.createStore.call(void 0, /* @__PURE__ */ new Map(), storeReducer);
function useAssetCache({
  urls,
  isLoaded: isLoaded2,
  load: load2,
  resolve: resolve2
}) {
  const cache = _reactconcurrentstore.useStore.call(void 0, store);
  const current = _react.useMemo.call(void 0, () => {
    return loadFromCache(cache, { urls, isLoaded: isLoaded2, load: load2, resolve: resolve2 });
  }, [cache, urls, isLoaded2, load2, resolve2]);
  const cached = _react.useMemo.call(void 0, () => _nullishCoalesce(cache.get(current.hash), () => ( null)), [cache, current.hash]);
  _react.useEffect.call(void 0, () => {
    if (!cached) {
      store.update({
        type: "update",
        payload: current.cached
      });
    }
  }, [cached, current.cached]);
  return _nullishCoalesce(cached, () => ( current.cached));
}

// src/hooks/useWarnOnRemount.ts

var noop = (_hook) => {
};
var useWarnOnRemount = (
  // @ts-ignore -- dev only
  process.env.NODE_ENV === "production" ? noop : (hook) => {
    _react.useEffect.call(void 0, () => {
      if (hook.hasMountedTag === console.log.name) {
        console.warn(`${hook.name} should only be mounted once during the lifetime of the app`);
      } else if (hook.hasMountedTag === void 0) {
        hook.hasMountedTag = console.log.name;
      }
    }, []);
  }
);










exports.isLoaded = isLoaded; exports.isBundleLoaded = isBundleLoaded; exports.load = load; exports.loadBundle = loadBundle; exports.resolve = resolve; exports.resolveBundle = resolveBundle; exports.useAssetCache = useAssetCache; exports.useWarnOnRemount = useWarnOnRemount;
//# sourceMappingURL=chunk-NFSDAYNN.cjs.map