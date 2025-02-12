"use strict";Object.defineProperty(exports, "__esModule", {value: true});







var _chunkY6YBMKNJcjs = require('./chunk-Y6YBMKNJ.cjs');

// src/useAssets.ts
var _react = require('react');
function useAssets(urls) {
  const [state, setState, thenable] = _chunkY6YBMKNJcjs.useAssetState.call(void 0, urls, _chunkY6YBMKNJcjs.isLoaded, _chunkY6YBMKNJcjs.load, _chunkY6YBMKNJcjs.resolve);
  _react.useEffect.call(void 0, () => {
    thenable == null ? void 0 : thenable.then((data) => setState({ isLoaded: true, error: null, data })).catch((error) => setState({ isLoaded: true, error, data: void 0 }));
  }, [setState, thenable]);
  return state;
}

// src/useAssetBundle.ts

function useAssetBundle(bundles) {
  const [state, setState, thenable] = _chunkY6YBMKNJcjs.useAssetState.call(void 0, bundles, _chunkY6YBMKNJcjs.isBundleLoaded, _chunkY6YBMKNJcjs.loadBundle, _chunkY6YBMKNJcjs.resolveBundle);
  _react.useEffect.call(void 0, () => {
    thenable == null ? void 0 : thenable.then((data) => setState({ isLoaded: true, error: null, data })).catch((error) => setState({ isLoaded: true, error, data: void 0 }));
  }, [setState, thenable]);
  return state;
}

// src/useAssetManifest.ts
var _pixijs = require('pixi.js');

function useAssetManifest(manifest, bundles = [], options = {}) {
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