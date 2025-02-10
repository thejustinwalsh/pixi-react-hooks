import { UnresolvedAsset } from 'pixi.js';

type AssetState<T> = {
    isLoaded: boolean;
    error: Error | null;
    data: T;
};
declare function useAssets<T>(urls: string | UnresolvedAsset): AssetState<T | undefined>;
declare function useAssets<T>(urls: string[] | UnresolvedAsset[]): AssetState<Record<string, T>>;
declare function useSuspenseAssets<T>(urls: string | UnresolvedAsset): T;
declare function useSuspenseAssets<T>(urls: string[] | UnresolvedAsset[]): Record<string, T>;

export { type AssetState, useAssets, useSuspenseAssets };
