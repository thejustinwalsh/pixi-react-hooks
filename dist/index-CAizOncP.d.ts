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

export type { AssetState as A };
