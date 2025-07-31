import { UnresolvedAsset, AssetsManifest, Assets } from 'pixi.js';
import { A as AssetState } from './index-CAizOncP.cjs';

declare function useAssets<T>(urls: string | UnresolvedAsset): AssetState<T | undefined>;
declare function useAssets<T>(urls: string[] | UnresolvedAsset[]): AssetState<Record<string, T>>;

declare function useAssetBundle<T extends Record<string, unknown>>(bundles: string | string[]): AssetState<T>;

declare function useAssetManifest(manifest: AssetsManifest, bundles?: string[], options?: Omit<Parameters<typeof Assets.init>[0], 'manifest'>): {
    isLoaded: boolean;
};

export { useAssetBundle, useAssetManifest, useAssets };
