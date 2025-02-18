import { ResolvedAsset } from 'pixi.js';

type LoadedAssetState<T> = {
    status: 'loaded';
    isLoaded: true;
    error: null;
    data: T;
};
type PendingAssetState = {
    status: 'pending';
    isLoaded: false;
    error: null;
    data: null;
};
type ErrorAssetState = {
    status: 'error';
    isLoaded: false;
    error: Error;
    data: null;
};
type AssetState<T> = LoadedAssetState<T> | PendingAssetState | ErrorAssetState;
type AssetBundle = Record<string, ResolvedAsset> | Record<string, Record<string, ResolvedAsset>>;

export type { AssetState as A, AssetBundle as a };
