"use strict";Object.defineProperty(exports, "__esModule", {value: true}); function _optionalChain(ops) { let lastAccessLHS = undefined; let value = ops[0]; let i = 1; while (i < ops.length) { const op = ops[i]; const fn = ops[i + 1]; i += 2; if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) { return undefined; } if (op === 'access' || op === 'optionalAccess') { lastAccessLHS = value; value = fn(value); } else if (op === 'call' || op === 'optionalCall') { value = fn((...args) => value.call(lastAccessLHS, ...args)); lastAccessLHS = undefined; } } return value; }







var _chunkNHYITDMScjs = require('./chunk-NHYITDMS.cjs');

// src/useAssets.ts
var _react = require('react');
function useAssets(urls) {
  const [state, setState, thenable] = _chunkNHYITDMScjs.useAssetState.call(void 0, urls, _chunkNHYITDMScjs.isLoaded, _chunkNHYITDMScjs.load, _chunkNHYITDMScjs.resolve);
  _react.useEffect.call(void 0, () => {
    _optionalChain([thenable, 'optionalAccess', _ => _.then, 'call', _2 => _2((data) => setState({ status: "loaded", isLoaded: true, error: null, data })), 'access', _3 => _3.catch, 'call', _4 => _4((error) => setState({ status: "error", isLoaded: false, error, data: null }))]);
  }, [setState, thenable]);
  return state;
}

// src/useAssetBundle.ts

function useAssetBundle(bundles) {
  const [state, setState, thenable] = _chunkNHYITDMScjs.useAssetState.call(void 0, 
    bundles,
    _chunkNHYITDMScjs.isBundleLoaded,
    _chunkNHYITDMScjs.loadBundle,
    _chunkNHYITDMScjs.resolveBundle
  );
  _react.useEffect.call(void 0, () => {
    _optionalChain([thenable, 'optionalAccess', _5 => _5.then, 'call', _6 => _6((data) => setState({ status: "loaded", isLoaded: true, error: null, data })), 'access', _7 => _7.catch, 'call', _8 => _8((error) => setState({ status: "error", isLoaded: false, error, data: null }))]);
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