import { UnresolvedAsset, ResolvedAsset, AssetsManifest, Assets } from 'pixi.js';

type AssetState<T> = {
    status: 'pending';
    isLoaded: false;
    error: Error | null;
    data: null;
} | {
    status: 'loaded';
    isLoaded: true;
    error: null;
    data: T;
} | {
    status: 'error';
    isLoaded: false;
    error: Error;
    data: null;
};

declare function useAssets<T>(urls: string | UnresolvedAsset): AssetState<T | undefined>;
declare function useAssets<T>(urls: string[] | UnresolvedAsset[]): AssetState<Record<string, T>>;

declare function useAssetBundle(bundles: string): AssetState<Record<string, ResolvedAsset>>;
declare function useAssetBundle(bundles: string[]): AssetState<Record<string, Record<string, ResolvedAsset>>>;

declare function useAssetManifest(manifest: AssetsManifest, bundles?: string[], options?: Omit<Parameters<typeof Assets.init>[0], 'manifest'>): {
    isLoaded: boolean;
};

export { useAssetBundle, useAssetManifest, useAssets };
