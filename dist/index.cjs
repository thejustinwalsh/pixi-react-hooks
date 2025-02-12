"use strict";Object.defineProperty(exports, "__esModule", {value: true});





var _chunkSGOR24EJcjs = require('./chunk-SGOR24EJ.cjs');

// src/assets/useAssets.ts
var _react = require('react');
var _pixijs = require('pixi.js');
function useAssets(urls) {
  const { state, setState, thenable } = _chunkSGOR24EJcjs.useAssetState.call(void 0, urls, _chunkSGOR24EJcjs.isLoaded, _pixijs.Assets.load, _chunkSGOR24EJcjs.resolve);
  _react.useEffect.call(void 0, () => {
    thenable == null ? void 0 : thenable.then((data) => setState({ isLoaded: true, error: null, data })).catch((error) => setState({ isLoaded: true, error, data: void 0 }));
  }, [thenable]);
  return state;
}

// src/assets/useAssetBundle.ts


function useAssetBundle(bundles) {
  const { state, setState, thenable } = _chunkSGOR24EJcjs.useAssetState.call(void 0, bundles, _chunkSGOR24EJcjs.isBundleLoaded, _pixijs.Assets.loadBundle, _chunkSGOR24EJcjs.resolveBundle);
  _react.useEffect.call(void 0, () => {
    thenable == null ? void 0 : thenable.then((data) => setState({ isLoaded: true, error: null, data })).catch((error) => setState({ isLoaded: true, error, data: void 0 }));
  }, [thenable]);
  return state;
}

// src/assets/useAssetManifest.ts


var manifestSingleton = null;
function useAssetManifest(manifest, bundles = [], options = {}) {
  const [isLoaded2, setIsLoaded] = _react.useState.call(void 0, false);
  _react.useEffect.call(void 0, () => {
    (async () => {
      await _pixijs.Assets.init({
        ...options,
        manifest
      });
      _pixijs.Assets.backgroundLoadBundle(
        bundles.length > 0 ? bundles : manifest.bundles.map((bundle) => bundle.name)
      );
      setIsLoaded(true);
    })();
  }, []);
  if (manifestSingleton !== null && manifestSingleton !== manifest) {
    console.warn("useAssetManifest should only be used once in your app");
  }
  manifestSingleton = manifest;
  return { isLoaded: isLoaded2 };
}




exports.useAssetBundle = useAssetBundle; exports.useAssetManifest = useAssetManifest; exports.useAssets = useAssets;
//# sourceMappingURL=index.cjs.map