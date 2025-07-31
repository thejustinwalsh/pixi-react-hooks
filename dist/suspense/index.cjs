"use strict";Object.defineProperty(exports, "__esModule", {value: true});








var _chunkNFSDAYNNcjs = require('../chunk-NFSDAYNN.cjs');

// src/suspense/useAssets.ts
var _react = require('react');
function useAssets(urls) {
  const cache = _chunkNFSDAYNNcjs.useAssetCache.call(void 0, { urls, isLoaded: _chunkNFSDAYNNcjs.isLoaded, load: _chunkNFSDAYNNcjs.load, resolve: _chunkNFSDAYNNcjs.resolve });
  return _react.use.call(void 0, cache.promise);
}

// src/suspense/useAssetBundle.ts

function useAssetBundle(bundles) {
  const cache = _chunkNFSDAYNNcjs.useAssetCache.call(void 0, {
    urls: bundles,
    isLoaded: _chunkNFSDAYNNcjs.isBundleLoaded,
    load: _chunkNFSDAYNNcjs.loadBundle,
    resolve: _chunkNFSDAYNNcjs.resolveBundle
  });
  return _react.use.call(void 0, cache.promise);
}

// src/suspense/useAssetManifest.ts

var _pixijs = require('pixi.js');
function useAssetManifest(manifest, bundles = [], options = {}) {
  _chunkNFSDAYNNcjs.useWarnOnRemount.call(void 0, useAssetManifest);
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