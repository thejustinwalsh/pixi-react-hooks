"use strict";Object.defineProperty(exports, "__esModule", {value: true});







var _chunkY6YBMKNJcjs = require('../chunk-Y6YBMKNJ.cjs');

// src/suspense/useAssets.ts
var _react = require('react');
function useAssets(urls) {
  const [state, _, thenable] = _chunkY6YBMKNJcjs.useAssetState.call(void 0, urls, _chunkY6YBMKNJcjs.isLoaded, _chunkY6YBMKNJcjs.load, _chunkY6YBMKNJcjs.resolve);
  return state.isLoaded ? state.data : _react.use.call(void 0, thenable);
}

// src/suspense/useAssetBundle.ts

function useAssetBundle(bundles) {
  const [state, _, thenable] = _chunkY6YBMKNJcjs.useAssetState.call(void 0, bundles, _chunkY6YBMKNJcjs.isBundleLoaded, _chunkY6YBMKNJcjs.loadBundle, _chunkY6YBMKNJcjs.resolveBundle);
  return state.isLoaded ? state.data : _react.use.call(void 0, thenable);
}

// src/suspense/useAssetManifest.ts

var _pixijs = require('pixi.js');
function useAssetManifest(manifest, bundles = [], options = {}) {
  const [thenable] = _react.useState.call(void 0, 
    () => _pixijs.Assets.init({ ...options, manifest }).then(
      () => _pixijs.Assets.backgroundLoadBundle(
        bundles.length > 0 ? bundles : manifest.bundles.map((bundle) => bundle.name)
      )
    )
  );
  return _react.use.call(void 0, thenable);
}




exports.useAssetBundle = useAssetBundle; exports.useAssetManifest = useAssetManifest; exports.useAssets = useAssets;
//# sourceMappingURL=index.cjs.map