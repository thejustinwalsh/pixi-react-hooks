import {renderHook, waitFor} from '@testing-library/react';
import {Assets} from 'pixi.js';
import {useAssets} from './useAssets';
import {vi, describe, it, expect, beforeEach} from 'vitest';

describe('useAssets', () => {
  beforeEach(() => {
    vi.resetAllMocks();
  });

  it('should handle successful loading of a single asset', async () => {
    const mockTexture = {id: 'texture1'};
    const loadPromise = Promise.resolve(mockTexture);
    vi.spyOn(Assets, 'load').mockReturnValue(loadPromise);

    const {result} = renderHook(() => useAssets('./texture.png'));

    // Initial state
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBeNull();

    // Wait for load to complete
    await loadPromise;
    await waitFor(() => expect(result.current.isLoaded).toBe(true), {timeout: 1000});
    expect(result.current.error).toBeNull();
    expect(result.current.data).toBe(mockTexture);
  });

  it('should handle loading multiple assets', async () => {
    const mockTextures = {
      './texture1.png': {id: 'texture1'},
      './texture2.png': {id: 'texture2'},
    };
    const loadPromise = Promise.resolve(mockTextures);
    vi.spyOn(Assets, 'load').mockReturnValue(loadPromise);

    const {result} = renderHook(() => useAssets(['./texture1.png', './texture2.png']));

    // Initial state
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.error).toBeNull();

    // Wait for load to complete
    await loadPromise;
    await waitFor(() => expect(result.current.isLoaded).toBe(true), {timeout: 1000});
    expect(result.current.error).toBeNull();
    expect(result.current.data).toEqual(mockTextures);
  });

  it('should handle loading errors', async () => {
    const error = 'Failed to load asset';
    const loadPromise = new Promise<Record<string, unknown>>((_, reject) => {
      reject(Error(error));
    });

    vi.spyOn(Assets, 'load').mockReturnValue(loadPromise);

    const {result} = renderHook(() => useAssets('./texture.png'));

    // Initial state
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.error).toBeNull();

    // Wait for error to be caught
    await waitFor(() => expect(result.current.error?.message).toBe(error), {timeout: 1000});
    expect(result.current.isLoaded).toBe(false);
    expect(result.current.data).toBeNull();
  });

  it('should reload assets when url changes', async () => {
    const mockTexture1 = {id: 'texture1'};
    const mockTexture2 = {id: 'texture2'};
    const loadSpy = vi.spyOn(Assets, 'load');

    const load1Promise = Promise.resolve(mockTexture1);
    const load2Promise = Promise.resolve(mockTexture2);
    loadSpy.mockReturnValueOnce(load1Promise).mockReturnValueOnce(load2Promise);

    const {result, rerender} = renderHook(url => useAssets(url), {
      initialProps: './texture1.png',
    });

    // Wait for first load
    await load1Promise;
    await waitFor(() => expect(result.current.data).toBe(mockTexture1), {timeout: 1000});

    // Change URL
    rerender('./texture2.png');

    // Wait for second load
    await load2Promise;
    await waitFor(() => expect(result.current.data).toBe(mockTexture2), {timeout: 1000});
    expect(loadSpy).toHaveBeenCalledTimes(2);
  });
});
