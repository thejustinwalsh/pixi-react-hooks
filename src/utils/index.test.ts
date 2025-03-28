import {vi, describe, it, expect, beforeEach} from 'vitest';
import {Assets} from 'pixi.js';
import {
  key,
  createKey,
  didKeyChange,
  isLoaded,
  isBundleLoaded,
  resolve,
  resolveBundle,
} from './index';

describe('Asset Utils', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  describe('key', () => {
    it('should return string url directly', () => {
      expect(key('test.png')).toBe('test.png');
    });

    it('should handle UnresolvedAsset with alias', () => {
      expect(key({alias: 'test', src: 'test.png'})).toBe('test');
    });

    it('should fallback to src if no alias', () => {
      expect(key({src: 'test.png'})).toBe('test.png');
    });
  });

  describe('createKey', () => {
    it('should create Set from single string', () => {
      const result = createKey('test.png');
      expect(result).toBeInstanceOf(Set);
      expect(result.has('test.png')).toBe(true);
    });

    it('should create Set from array of strings', () => {
      const result = createKey(['test1.png', 'test2.png']);
      expect(result.has('test1.png')).toBe(true);
      expect(result.has('test2.png')).toBe(true);
    });
  });

  describe('didKeyChange', () => {
    it('should detect changes in single url', () => {
      const keys = new Set(['old.png']);
      expect(didKeyChange('new.png', keys)).toBe(true);
      expect(didKeyChange('old.png', keys)).toBe(false);
    });

    it('should detect changes in url array', () => {
      const keys = new Set(['test1.png', 'test2.png']);
      expect(didKeyChange(['test1.png', 'test3.png'], keys)).toBe(true);
      expect(didKeyChange(['test1.png', 'test2.png'], keys)).toBe(false);
    });
  });

  describe('isLoaded', () => {
    beforeEach(() => {
      vi.spyOn(Assets.cache, 'has').mockImplementation(k => k === 'loaded.png');
    });

    it('should check single asset loaded state', () => {
      expect(isLoaded('loaded.png')).toBe(true);
      expect(isLoaded('notloaded.png')).toBe(false);
    });

    it('should check multiple assets loaded state', () => {
      expect(isLoaded(['loaded.png', 'loaded.png'])).toBe(true);
      expect(isLoaded(['loaded.png', 'notloaded.png'])).toBe(false);
    });
  });

  describe('isBundleLoaded', () => {
    beforeEach(() => {
      vi.spyOn(Assets.resolver, 'hasBundle').mockImplementation(b => b === 'loaded-bundle');
    });

    it('should check single bundle loaded state', () => {
      expect(isBundleLoaded('loaded-bundle')).toBe(true);
      expect(isBundleLoaded('notloaded-bundle')).toBe(false);
    });

    it('should check multiple bundles loaded state', () => {
      expect(isBundleLoaded(['loaded-bundle', 'loaded-bundle'])).toBe(true);
      expect(isBundleLoaded(['loaded-bundle', 'notloaded-bundle'])).toBe(false);
    });
  });

  describe('resolve', () => {
    beforeEach(() => {
      const cache = new Map([
        ['test1.png', 'texture1'],
        ['test2.png', 'texture2'],
      ]);
      vi.spyOn(Assets.cache, 'has').mockImplementation(k => cache.has(k as string));
      vi.spyOn(Assets.cache, 'get').mockImplementation(k => cache.get(k as string));
    });

    it('should resolve single asset', () => {
      expect(resolve('test1.png')).toBe('texture1');
    });

    it('should resolve multiple assets', () => {
      expect(resolve(['test1.png', 'test2.png'])).toEqual({
        'test1.png': 'texture1',
        'test2.png': 'texture2',
      });
    });
  });

  describe('resolveBundle', () => {
    beforeEach(() => {
      vi.spyOn(Assets.resolver, 'resolveBundle').mockImplementation(bundle => ({
        [bundle.toString()]: {
          data: true,
        },
      }));
    });

    it('should resolve bundle through Assets resolver', () => {
      expect(resolveBundle('test-bundle')).toEqual({
        'test-bundle': {
          data: true,
        },
      });
    });
  });
});
