import {render, screen, waitFor, cleanup} from '@testing-library/react';
import {Assets} from 'pixi.js';
import {vi, describe, it, expect, beforeEach, afterEach, afterAll} from 'vitest';
import {act, Suspense} from 'react';
import {ErrorBoundary, FallbackProps} from 'react-error-boundary';
import {key} from '../utils';

import * as useAssetsModule from './useAssets';
import * as useAssetCacheOriginal from '../hooks/useAssetCache';
import * as useAssetCacheGlobal from '../hooks/useAssetCacheGlobal';

const {useAssets} = useAssetsModule;
const {useAssetCache} = useAssetCacheOriginal;

// Test components
function LoadSingleAsset({url, isRefreshing}: {url: string; isRefreshing?: boolean}) {
  const texture = useAssets<{id: string; data: string}>(url);
  return (
    <div data-testid="asset">
      {texture.id}:{texture.data}:{isRefreshing ? 'refreshing' : 'loaded'}
    </div>
  );
}

function LoadMultipleAssets({urls}: {urls: string[]}) {
  const textures = useAssets<{id: string; data: string}>(urls);
  return (
    <div data-testid="assets">
      {Object.entries(textures).map(([key, texture]) => (
        <div key={key} data-testid={`asset-${key}`}>
          {texture.id}:{texture.data}
        </div>
      ))}
    </div>
  );
}

// Error fallback component
function ErrorFallback({error}: FallbackProps) {
  return <div data-testid="error">{error}</div>;
}

function setupBeforeEach() {
  const results: Record<string, any> = {};
  const cache = new Map();
  const promises = new Array<[() => void, (reason?: any) => void]>();

  const resolve = () => {
    const count = promises.length;
    promises.forEach(([resolver]) => resolver());
    promises.length = 0;
    return count;
  };
  const reject = (reason?: any) => {
    const count = promises.length;
    promises.forEach(([_, reject]) => reject(reason));
    promises.length = 0;
    return count;
  };

  vi.spyOn(Assets, 'load').mockImplementation(async urls => {
    Object.keys(results).forEach(key => delete results[key]);
    Object.assign(
      results,
      Array.isArray(urls)
        ? urls.reduce((acc, url) => {
            acc[key(url)] = {id: url, data: crypto.randomUUID()};
            return acc;
          }, {} as Record<string, unknown>)
        : {id: key(urls), data: crypto.randomUUID()},
    );

    return new Promise((resolve, reject) => {
      const resolver = () => {
        if (Array.isArray(urls)) {
          Object.entries(results).forEach(([key, result]) => {
            cache.set(key, result);
          });
        } else {
          cache.set(key(urls), results);
        }
        resolve(results);
      };
      promises.push([resolver, reject] as const);
    });
  });

  vi.spyOn(Assets.cache, 'has').mockImplementation(key => cache.has(key));
  vi.spyOn(Assets.cache, 'get').mockImplementation(key => cache.get(key));
  vi.spyOn(Assets.cache, 'remove').mockImplementation(key => cache.delete(key));
  vi.spyOn(Assets.cache, 'reset').mockImplementation(() => cache.clear());

  return {results, resolve, reject};
}

describe('useAssets with Suspense', () => {
  let results: Record<string, any> = {};
  let resolve: () => void;
  let reject: (reason?: any) => void;

  beforeEach(() => ({results, resolve, reject} = setupBeforeEach()));

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
  });

  it('should handle successful loading of a single asset', async () => {
    const useAssetsSpy = vi.spyOn(useAssetsModule, 'useAssets');

    await act(async () =>
      render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadSingleAsset url="./texture.png" />
          </Suspense>
        </ErrorBoundary>,
      ),
    );

    // Check loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve the async actions
    await act(async () => resolve());

    // The component should now be rendered with the loaded texture
    await waitFor(async () => {
      expect(screen.getByTestId('asset')).toHaveTextContent('./texture.png');
      expect(screen.getByTestId('asset')).toHaveTextContent(
        `./texture.png:${Object.entries(results).find(([k, v]) => k === 'data')?.[1]}`,
      );
    });
  });

  it('should handle loading multiple assets', async () => {
    await act(async () =>
      render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadMultipleAssets urls={['./texture1.png', './texture2.png']} />
          </Suspense>
        </ErrorBoundary>,
      ),
    );

    // Check loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve the async actions
    await act(async () => resolve());

    // Wait for load to complete
    await waitFor(async () => {
      expect(screen.getByTestId('asset-./texture1.png')).toHaveTextContent('./texture1.png');
      expect(screen.getByTestId('asset-./texture1.png')).toHaveTextContent(
        `./texture1.png:${
          Object.entries(results['./texture1.png']).find(([k, v]) => k === 'data')?.[1]
        }`,
      );
      expect(screen.getByTestId('asset-./texture2.png')).toHaveTextContent('./texture2.png');
      expect(screen.getByTestId('asset-./texture2.png')).toHaveTextContent(
        `./texture2.png:${
          Object.entries(results['./texture2.png']).find(([k, v]) => k === 'data')?.[1]
        }`,
      );
    });
  });

  it('should handle loading errors', async () => {
    const error = 'Failed to load asset';

    await act(async () => {
      render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadSingleAsset url="./texture.png" />
          </Suspense>
        </ErrorBoundary>,
      );
    });

    // Check loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve the async actions
    await act(async () => reject(error));

    await waitFor(
      async () => {
        expect(screen.getByTestId('error')).toHaveTextContent(error);
      },
      {timeout: 1000},
    );
  });

  it('should attempt to reload assets when recovering from an error', async () => {
    const error = 'Failed to load asset';

    let reset: () => void;
    function ErrorFallbackAndRetry({error, resetErrorBoundary}: FallbackProps) {
      const [isPending, refresh] = useAssetCache();
      reset = () => {
        if (!isPending) {
          refresh();
          resetErrorBoundary();
        }
      };
      return <div data-testid="error">{error}</div>;
    }

    function TestWrapper() {
      return (
        <ErrorBoundary FallbackComponent={ErrorFallbackAndRetry}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadSingleAsset url="./texture.png" />
          </Suspense>
        </ErrorBoundary>
      );
    }

    // Initial render
    const {rerender} = await act(async () => render(<TestWrapper />));

    // Check loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve the async actions
    await act(async () => reject(error));

    await waitFor(
      async () => {
        expect(screen.getByTestId('error')).toHaveTextContent(error);
      },
      {timeout: 1000},
    );

    // Re-render with resetErrorBoundary set to true
    await act(async () => reset());

    // Resolve the async actions
    await act(async () => resolve());

    // Check that the error is reset
    await waitFor(async () => {
      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });

    // Check that the asset is loaded
    await waitFor(async () => {
      expect(screen.getByTestId('asset')).toHaveTextContent('./texture.png');
      expect(screen.getByTestId('asset')).toHaveTextContent(
        `./texture.png:${Object.entries(results).find(([k, v]) => k === 'data')?.[1]}`,
      );
    });
  });

  it('should reload assets when url changes', async () => {
    function TestWrapper({url}: {url: string}) {
      return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadSingleAsset url={url} />
          </Suspense>
        </ErrorBoundary>
      );
    }

    const {rerender} = await act(async () => render(<TestWrapper url="./texture1.png" />));

    // Check loading state first
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await act(async () => resolve());

    await waitFor(async () => {
      expect(screen.getByTestId('asset')).toHaveTextContent('texture1');
      expect(screen.getByTestId('asset')).toHaveTextContent(
        `./texture1.png:${Object.entries(results).find(([k, v]) => k === 'data')?.[1]}`,
      );
    });

    // Change URL using rerender
    await act(async () => rerender(<TestWrapper url="./texture2.png" />));

    // Should show loading again
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve the async actions
    await act(async () => resolve());

    // Wait for second load
    await waitFor(async () => {
      expect(screen.getByTestId('asset')).toHaveTextContent('texture2');
      expect(screen.getByTestId('asset')).toHaveTextContent(
        `./texture2.png:${Object.entries(results).find(([k, v]) => k === 'data')?.[1]}`,
      );
    });
  });

  it('should handle reloading same asset with new data', async () => {
    let reload: () => void;

    function TestWrapper({url}: {url: string}) {
      const [, refresh] = useAssetCache();
      reload = () => refresh(['./texture1.png']);

      return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadSingleAsset url={url} />
          </Suspense>
        </ErrorBoundary>
      );
    }

    const {rerender} = await act(async () => render(<TestWrapper url="./texture1.png" />));

    // Check loading state first
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve pending promises
    await act(async () => resolve());

    // Verify initial load
    let initialData: string;
    await waitFor(async () => {
      initialData = Object.entries(results).find(([k, v]) => k === 'data')?.[1];
      expect(screen.getByTestId('asset')).toHaveTextContent('texture1');
      expect(screen.getByTestId('asset')).toHaveTextContent(initialData);
      expect(Assets.cache.has(key('./texture1.png'))).toBe(true);
    });

    // Re-load the asset
    await act(async () => reload());

    // Ensure the cache was cleared for the asset
    await waitFor(async () => {
      expect(Assets.cache.has(key('./texture1.png'))).toBe(false);
    });

    // Resolve the pending promises
    await act(async () => resolve());

    await act(async () => {});

    // Verfiy the asset was reloaded
    await waitFor(async () => {
      const newData = Object.entries(results).find(([k]) => k === 'data')?.[1];
      expect(newData).not.toEqual(initialData);

      expect(screen.getByTestId('asset')).toHaveTextContent('texture1');
      expect(screen.getByTestId('asset')).toHaveTextContent(`./texture1.png:${newData}`);
    });
  });
});

describe('useAssets with Suspense (Global)', () => {
  let results: Record<string, any> = {};
  let resolve: () => void;
  let reject: (reason?: any) => void;

  beforeEach(() => {
    ({results, resolve, reject} = setupBeforeEach());
    vi.spyOn(useAssetCacheOriginal, 'usePromiseCache').mockImplementation(
      useAssetCacheGlobal.usePromiseCache,
    );
    vi.spyOn(useAssetCacheOriginal, 'useAssetCache').mockImplementation(
      useAssetCacheGlobal.useAssetCache,
    );
    vi.spyOn(useAssetCacheOriginal, 'loadFromCache').mockImplementation(
      useAssetCacheGlobal.loadFromCache,
    );
  });

  afterEach(() => {
    vi.resetAllMocks();
    cleanup();
    useAssetCacheGlobal.clearCache(); // We have to clear the global cache to invalidate the cache between tests
  });

  it('should handle successful loading of a single asset', async () => {
    await act(async () =>
      render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadSingleAsset url="./texture.png" />
          </Suspense>
        </ErrorBoundary>,
      ),
    );

    // Check loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve the async actions
    await act(async () => resolve());

    // The component should now be rendered with the loaded texture
    await waitFor(async () => {
      expect(screen.getByTestId('asset')).toHaveTextContent('./texture.png');
    });
  });

  it('should handle loading multiple assets', async () => {
    await act(async () =>
      render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadMultipleAssets urls={['./texture1.png', './texture2.png']} />
          </Suspense>
        </ErrorBoundary>,
      ),
    );

    // Check loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve the async actions
    await act(async () => resolve());

    // Wait for load to complete
    await waitFor(async () => {
      expect(screen.getByTestId('asset-./texture1.png')).toHaveTextContent('./texture1.png');
      expect(screen.getByTestId('asset-./texture2.png')).toHaveTextContent('./texture2.png');
    });
  });

  it('should handle loading errors', async () => {
    const error = 'Failed to load asset';

    await act(async () =>
      render(
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadSingleAsset url="./texture.png" />
          </Suspense>
        </ErrorBoundary>,
      ),
    );

    // Check loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve the async actions
    await act(async () => reject(error));

    await act(async () => render(<div />));

    await waitFor(
      async () => {
        expect(screen.getByTestId('error')).toHaveTextContent(error);
      },
      {timeout: 1000},
    );
  });

  it('should attempt to reload assets when recovering from an error', async () => {
    const error = 'Failed to load asset';

    let reset: () => void;
    function ErrorFallbackAndRetry({error, resetErrorBoundary}: FallbackProps) {
      const [isPending, refresh] = useAssetCacheGlobal.useAssetCache();
      reset = () => {
        if (!isPending) {
          refresh();
          resetErrorBoundary();
        }
      };
      return <div data-testid="error">{error}</div>;
    }

    function TestWrapper() {
      return (
        <ErrorBoundary FallbackComponent={ErrorFallbackAndRetry}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadSingleAsset url="./texture.png" />
          </Suspense>
        </ErrorBoundary>
      );
    }

    // Initial render
    const {rerender} = await act(async () => render(<TestWrapper />));

    // Check loading state
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve the async actions
    await act(async () => reject(error));

    await waitFor(
      async () => {
        expect(screen.getByTestId('error')).toHaveTextContent(error);
      },
      {timeout: 1000},
    );

    // Re-render with resetErrorBoundary set to true
    await act(async () => reset());

    // Resolve the async actions
    await act(async () => resolve());

    // Check that the error is reset
    await waitFor(async () => {
      expect(screen.queryByTestId('error')).not.toBeInTheDocument();
    });

    // Check that the asset is loaded
    await waitFor(async () => {
      expect(screen.getByTestId('asset')).toHaveTextContent('./texture.png');
    });
  });

  it('should reload assets when url changes', async () => {
    function TestWrapper({url}: {url: string}) {
      return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadSingleAsset url={url} />
          </Suspense>
        </ErrorBoundary>
      );
    }

    const {rerender} = await act(async () => render(<TestWrapper url="./texture1.png" />));

    // Check loading state first
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await act(async () => resolve());

    await waitFor(async () => {
      expect(screen.getByTestId('asset')).toHaveTextContent('texture1');
      expect(screen.getByTestId('asset')).toHaveTextContent(
        `./texture1.png:${Object.entries(results).find(([k, v]) => k === 'data')?.[1]}`,
      );
    });

    // Change URL using rerender
    await act(async () => rerender(<TestWrapper url="./texture2.png" />));

    // Should show loading again
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve the async actions
    await act(async () => resolve());

    // Wait for second load
    await waitFor(async () => {
      expect(screen.getByTestId('asset')).toHaveTextContent('texture2');
      expect(screen.getByTestId('asset')).toHaveTextContent(
        `./texture2.png:${Object.entries(results).find(([k, v]) => k === 'data')?.[1]}`,
      );
    });
  });

  it('should handle reloading same asset with new data', async () => {
    let reload: () => void;

    function TestWrapper({url}: {url: string}) {
      const [, refresh] = useAssetCache();
      reload = () => refresh(['./texture1.png']);

      return (
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <Suspense fallback={<div data-testid="loading">Loading...</div>}>
            <LoadSingleAsset url={url} />
          </Suspense>
        </ErrorBoundary>
      );
    }

    const {rerender} = await act(async () => render(<TestWrapper url="./texture1.png" />));

    // Check loading state first
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    // Resolve pending promises
    await act(async () => resolve());

    // Verify initial load
    let initialData: string;
    await waitFor(async () => {
      initialData = Object.entries(results).find(([k, v]) => k === 'data')?.[1];
      expect(screen.getByTestId('asset')).toHaveTextContent('texture1');
      expect(screen.getByTestId('asset')).toHaveTextContent(initialData);
      expect(Assets.cache.has(key('./texture1.png'))).toBe(true);
    });

    // Re-load the asset
    await act(async () => reload());

    /* ERROR:
     * Calling the refresh method returned from useCacheRefresh when using secret
     * internals causes a re-render within the component with the new cached state
     * (undefined) which we can use to trigger a re-render of the component with
     * the new data. The api in experimental also allows you to seed the cache
     * with a new promise/value before the render, but we can't do that with the *public api.
     */

    /* WORKAROUND:
     * Our useCacheRefresh hook could use useSyncExternalStore to trigger
     * a re-render of the component with the new cache data, and implement the
     * experimental api that also takes a seed. This method however, will force
     * react to use a blocking update, and de-opting to synchronous rendering.
     */

    // Ensure the cache was cleared for the asset
    await waitFor(async () => {
      expect(Assets.cache.has(key('./texture1.png'))).toBe(false);
    });

    await waitFor(async () => {
      expect(screen.getByTestId('loading')).toBeInTheDocument();
    });

    // Resolve the pending promises
    await act(async () => resolve());

    // Verfiy the asset was reloaded
    await waitFor(async () => {
      const newData = Object.entries(results).find(([k]) => k === 'data')?.[1];
      expect(newData).not.toEqual(initialData);

      expect(screen.getByTestId('asset')).toHaveTextContent('texture1');
      expect(screen.getByTestId('asset')).toHaveTextContent(`./texture1.png:${newData}`);
    });
  });
});
