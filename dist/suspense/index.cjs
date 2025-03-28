"use strict";Object.defineProperty(exports, "__esModule", {value: true});







var _chunk3M5JBGFOcjs = require('../chunk-3M5JBGFO.cjs');

// src/suspense/useAssets.ts
var _react = require('react');
function useAssets(urls) {
  const [state, _, thenable] = _chunk3M5JBGFOcjs.useAssetState.call(void 0, urls, _chunk3M5JBGFOcjs.isLoaded, _chunk3M5JBGFOcjs.load, _chunk3M5JBGFOcjs.resolve);
  return state.isLoaded ? state.data : _react.use.call(void 0, thenable);
}

// src/suspense/useAssetBundle.ts

function useAssetBundle(bundles) {
  const [state, _, thenable] = _chunk3M5JBGFOcjs.useAssetState.call(void 0, 
    bundles,
    _chunk3M5JBGFOcjs.isBundleLoaded,
    _chunk3M5JBGFOcjs.loadBundle,
    _chunk3M5JBGFOcjs.resolveBundle
  );
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