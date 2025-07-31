"use strict";Object.defineProperty(exports, "__esModule", {value: true});








var _chunkNFSDAYNNcjs = require('./chunk-NFSDAYNN.cjs');

// src/useAssets.ts
var _react = require('react');
function useAssets(urls) {
  const cache = _chunkNFSDAYNNcjs.useAssetCache.call(void 0, { urls, isLoaded: _chunkNFSDAYNNcjs.isLoaded, load: _chunkNFSDAYNNcjs.load, resolve: _chunkNFSDAYNNcjs.resolve });
  const sync = _react.useRef.call(void 0, /* @__PURE__ */ new WeakSet());
  const [state, setState] = _react.useState.call(void 0, () => ({
    data: cache.data,
    error: null
  }));
  _react.useEffect.call(void 0, () => {
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

function useAssetBundle(bundles) {
  const cache = _chunkNFSDAYNNcjs.useAssetCache.call(void 0, {
    urls: bundles,
    isLoaded: _chunkNFSDAYNNcjs.isBundleLoaded,
    load: _chunkNFSDAYNNcjs.loadBundle,
    resolve: _chunkNFSDAYNNcjs.resolveBundle
  });
  const sync = _react.useRef.call(void 0, /* @__PURE__ */ new WeakSet());
  const [state, setState] = _react.useState.call(void 0, () => ({
    data: cache.data,
    error: null
  }));
  _react.useEffect.call(void 0, () => {
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
var _pixijs = require('pixi.js');

function useAssetManifest(manifest, bundles = [], options = {}) {
  _chunkNFSDAYNNcjs.useWarnOnRemount.call(void 0, useAssetManifest);
  const [{ isLoaded: isLoaded2, thenable }, setState] = _react.useState.call(void 0, () => ({
    isLoaded: false,
    thenable: _pixijs.Assets.init({
      ...options,
      manifest
    }).then(() => {
      _pixijs.Assets.backgroundLoadBundle(
        bundles.length > 0 ? bundles : manifest.bundles.map((bundle) => bundle.name)
      );
    })
  }));
  _react.useEffect.call(void 0, () => {
    thenable.then(() => setState((s) => ({ ...s, isLoaded: true })));
  }, [thenable]);
  return { isLoaded: isLoaded2 };
}




exports.useAssetBundle = useAssetBundle; exports.useAssetManifest = useAssetManifest; exports.useAssets = useAssets;
//# sourceMappingURL=index.cjs.map