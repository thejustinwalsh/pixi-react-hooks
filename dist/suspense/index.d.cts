import { UnresolvedAsset, AssetsManifest, Assets } from 'pixi.js';
import { A as AssetState } from '../index-CAizOncP.cjs';

declare function useAssets<T>(urls: string | UnresolvedAsset): T;
declare function useAssets<T>(urls: string[] | UnresolvedAsset[]): Record<string, T>;

declare function useAssetBundle<T extends Record<string, unknown>>(bundles: string | string[]): AssetState<T>;

declare function useAssetManifest(manifest: AssetsManifest, bundles?: string[], options?: Omit<Parameters<typeof Assets.init>[0], 'manifest'>): void;

export { useAssetBundle, useAssetManifest, useAssets };
