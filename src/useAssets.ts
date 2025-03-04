import {use, useEffect, useState} from 'react';
import {Assets} from 'pixi.js';

import type {UnresolvedAsset} from 'pixi.js';

export type AssetState<T> =
  | {
    status: "loading";
    isLoading: true;
    error: null;
    data: undefined;
  }
  | {
    status: "error";
    isLoading: false;
    error: Error;
    data: undefined;
  }
  | {
    status: "success";
    isLoading: false;
    error: null;
    data: T;
  };

type HookState<T> = {
  thenable?: Promise<T>;
  key: Set<string>;
};

export function useAssets<T>(urls: string | UnresolvedAsset): AssetState<T>;
export function useAssets<T>(urls: string[] | UnresolvedAsset[]): AssetState<Record<string, T>>;

export function useAssets<T>(urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]): AssetState<T | Record<string, T>> {
  const [assetState, setAssetState] = useState<AssetState<T | Record<string, T>>>(() => (isLoaded(urls) ? {
    status: "success",
    isLoading: false,
    error: null,
    data: resolve<T>(urls),
  } : {
    status: "loading",
    isLoading: true,
    error: null,
    data: undefined,
  }));

  const [state, setState] = useState<HookState<T>>(() => ({
    thenable: assetState.isLoading ? Assets.load(urls) : undefined,
    key: createKey(urls),
  }));

  useEffect(() => {
    if (didKeyChange(urls, state.key)) {
      const assetsLoaded = isLoaded(urls);
      setState(state => ({thenable: assetsLoaded ? state.thenable : Assets.load(urls), key: createKey(urls)}));
      setAssetState(
        assetsLoaded ? 
          {status: "success", isLoading: false, error: null, data: resolve<T>(urls)}
        : {status: "loading", isLoading: true, error: null, data: undefined});
    }
  }, [urls, state.key]);

  useEffect(() => {
    state.thenable
      ?.then(data => setAssetState({status: "success", isLoading: false, error: null, data}))
      .catch(error => setAssetState({status: "error", isLoading: false, error, data: undefined}));
  }, [state.thenable]);

  return assetState;
}

export function useSuspenseAssets<T>(urls: string | UnresolvedAsset): T;
export function useSuspenseAssets<T>(urls: string[] | UnresolvedAsset[]): Record<string, T>;

export function useSuspenseAssets<T>(urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) {
  const [state, setState] = useState<Required<HookState<T>>>(() => ({
    thenable: Assets.load(urls),
    key: createKey(urls),
  }));

  useEffect(() => {
    if (didKeyChange(urls, state.key)) {
      setState({thenable: Assets.load(urls), key: createKey(urls)});
    }
  }, [urls, state]);

  return use(state.thenable);
}

const key = (url: string | UnresolvedAsset) =>
  typeof url === 'string' ? url : (url.alias ?? url.src ?? '')?.toString();

const createKey = (urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) =>
  new Set(Array.isArray(urls) ? urls.map(key) : key(urls));

const didKeyChange = (urls: string | UnresolvedAsset | string[] | UnresolvedAsset[], keys: Set<string>) =>
  Array.isArray(urls) ? !urls.every(url => keys.has(key(url))) : !keys.has(key(urls));

const isLoaded = (urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) =>
  Array.isArray(urls) ? urls.every(url => Assets.cache.has(key(url))) : Assets.cache.has(key(urls));

const resolve = <T>(urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) =>
  Array.isArray(urls)
    ? urls.reduce(
        (acc, url) => {
          const k = key(url);
          if (Assets.cache.has(k)) acc[k] = Assets.cache.get<T>(k);
          return acc;
        },
        {} as Record<string, T>,
      )
    : Assets.cache.get<T>(key(urls));
