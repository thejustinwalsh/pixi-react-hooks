import {render, screen, waitFor, cleanup} from '@testing-library/react';
import {Assets} from 'pixi.js';
import {useAssets} from './useAssets';
import {vi, describe, it, expect, beforeEach} from 'vitest';
import {act, Suspense} from 'react';
import {ErrorBoundary} from 'react-error-boundary';
import {key} from '../utils';

// Test components
function LoadSingleAsset({url}: {url: string}) {
  const texture = useAssets<{id: string}>(url);
  return <div data-testid="asset">{texture.id}</div>;
}

function LoadMultipleAssets({urls}: {urls: string[]}) {
  const textures = useAssets<{id: string}>(urls);
  return (
    <div data-testid="assets">
      {Object.entries(textures).map(([key, texture]) => (
        <div key={key} data-testid={`asset-${key}`}>
          {texture.id}
        </div>
      ))}
    </div>
  );
}

// Error fallback component
function ErrorFallback({error}: {error: any}) {
  return <div data-testid="error">{error}</div>;
}

describe('useAssets with Suspense', () => {
  let resolve: () => void;
  let reject: (reason?: any) => void;

  beforeEach(() => {
    const cache = new Map();
    const promises = new Array<[() => void, (reason?: any) => void]>();
    resolve = () => {
      const count = promises.length;
      promises.forEach(([resolver]) => resolver());
      promises.length = 0;
      return count;
    };
    reject = (reason?: any) => {
      const count = promises.length;
      promises.forEach(([_, reject]) => reject(reason));
      promises.length = 0;
      return count;
    };

    vi.resetAllMocks();
    vi.spyOn(Assets, 'load').mockImplementation(async urls => {
      const results = Array.isArray(urls)
        ? urls.reduce((acc, url) => {
            acc[key(url)] = {id: url};
            return acc;
          }, {} as Record<string, unknown>)
        : {id: key(urls)};

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
    cleanup();
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
    });

    // Change URL using rerender
    await act(async () => rerender(<TestWrapper url="./texture2.png" />));

    // Should show loading again
    expect(screen.getByTestId('loading')).toBeInTheDocument();

    await act(async () => resolve());

    // Wait for second load
    await waitFor(async () => {
      expect(screen.getByTestId('asset')).toHaveTextContent('texture2');
    });
  });
});
