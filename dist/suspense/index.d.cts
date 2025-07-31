import { UnresolvedAsset, AssetsManifest, Assets } from 'pixi.js';
import { a as AssetBundle } from '../index-BbUYJT_H.cjs';

declare function useAssets<T>(urls: string | UnresolvedAsset): T;
declare function useAssets<T>(urls: string[] | UnresolvedAsset[]): Record<string, T>;

declare function useAssetBundle(bundles: string | string[]): AssetBundle;

declare function useAssetManifest(manifest: AssetsManifest, bundles?: string[], options?: Omit<Parameters<typeof Assets.init>[0], 'manifest'>): void;

export { useAssetBundle, useAssetManifest, useAssets };
