import {Assets} from 'pixi.js';

import type {UnresolvedAsset} from 'pixi.js';

export const key = (url: string | UnresolvedAsset) =>
  typeof url === 'string' ? url : (url.alias ?? url.src ?? '')?.toString();

export const createKey = (urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) =>
  new Set(Array.isArray(urls) ? urls.map(key) : [key(urls)]);

export const didKeyChange = (
  urls: string | UnresolvedAsset | string[] | UnresolvedAsset[],
  keys: Set<string>,
) => (Array.isArray(urls) ? !urls.every(url => keys.has(key(url))) : !keys.has(key(urls)));

export const isLoaded = (urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) =>
  Array.isArray(urls) ? urls.every(url => Assets.cache.has(key(url))) : Assets.cache.has(key(urls));

export const isBundleLoaded = (bundles: string | string[]) =>
  Array.isArray(bundles)
    ? bundles.every(bundle => Assets.resolver.hasBundle(bundle))
    : Assets.resolver.hasBundle(bundles);

export const load = (urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) =>
  Assets.load(urls);

export const loadBundle = (bundles: string | string[]) => Assets.loadBundle(bundles);

export const resolve = (urls: string | UnresolvedAsset | string[] | UnresolvedAsset[]) =>
  Array.isArray(urls)
    ? urls.reduce((acc, url) => {
        const k = key(url);
        if (Assets.cache.has(k)) acc[k] = Assets.cache.get(k);
        return acc;
      }, {} as Record<string, any>)
    : Assets.cache.get(key(urls));

export const resolveBundle = (bundles: string | string[]) =>
  Assets.resolver.resolveBundle(bundles) as any;
