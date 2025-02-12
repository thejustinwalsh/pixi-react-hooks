import { UnresolvedAsset, ResolvedAsset, AssetsManifest, Assets } from 'pixi.js';

declare function useAssets<T>(urls: string | UnresolvedAsset): T;
declare function useAssets<T>(urls: string[] | UnresolvedAsset[]): Record<string, T>;

declare function useAssetBundle(bundles: string | string[]): Record<string, ResolvedAsset<any>> | Record<string, Record<string, ResolvedAsset<any>> | Record<string, Record<string, ResolvedAsset<any>>>> | null;

declare function useAssetManifest(manifest: AssetsManifest, bundles?: string[], options?: Omit<Parameters<typeof Assets.init>[0], 'manifest'>): void;

export { useAssetBundle, useAssetManifest, useAssets };
