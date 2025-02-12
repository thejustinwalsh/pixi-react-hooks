"use strict";Object.defineProperty(exports, "__esModule", {value: true});







var _chunkDZ2C4WEOcjs = require('../chunk-DZ2C4WEO.cjs');

// src/suspense/useAssets.ts
var _react = require('react');
function useAssets(urls) {
  const [state, _, thenable] = _chunkDZ2C4WEOcjs.useAssetState.call(void 0, urls, _chunkDZ2C4WEOcjs.isLoaded, _chunkDZ2C4WEOcjs.load, _chunkDZ2C4WEOcjs.resolve);
  return state.isLoaded ? state.data : _react.use.call(void 0, thenable);
}

// src/suspense/useAssetBundle.ts

function useAssetBundle(bundles) {
  const [state, _, thenable] = _chunkDZ2C4WEOcjs.useAssetState.call(void 0, bundles, _chunkDZ2C4WEOcjs.isBundleLoaded, _chunkDZ2C4WEOcjs.loadBundle, _chunkDZ2C4WEOcjs.resolveBundle);
  return state.isLoaded ? state.data : _react.use.call(void 0, 
    thenable
  );
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