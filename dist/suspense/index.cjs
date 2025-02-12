"use strict";Object.defineProperty(exports, "__esModule", {value: true});





var _chunkSGOR24EJcjs = require('../chunk-SGOR24EJ.cjs');

// src/assets/suspense/useAssets.ts
var _react = require('react');
var _pixijs = require('pixi.js');
function useAssets(urls) {
  const { state, thenable } = _chunkSGOR24EJcjs.useAssetState.call(void 0, urls, _chunkSGOR24EJcjs.isLoaded, _pixijs.Assets.load, _chunkSGOR24EJcjs.resolve);
  return state.isLoaded ? state.data : _react.use.call(void 0, thenable);
}

// src/assets/suspense/useAssetBundle.ts


function useAssetBundle(bundles) {
  const { state, thenable } = _chunkSGOR24EJcjs.useAssetState.call(void 0, bundles, _chunkSGOR24EJcjs.isBundleLoaded, _pixijs.Assets.loadBundle, _chunkSGOR24EJcjs.resolveBundle);
  return state.isLoaded ? state.data : _react.use.call(void 0, thenable);
}

// src/assets/suspense/useAssetManifest.ts


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