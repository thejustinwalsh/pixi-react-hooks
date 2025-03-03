import '@testing-library/react';
import '@testing-library/jest-dom/vitest';
import {afterEach, vi} from 'vitest';

// Mock PIXI.Assets
vi.mock('pixi.js', () => ({
  Assets: {
    load: vi.fn(),
    cache: new Map(),
    get: vi.fn(),
    resolver: {
      hasBundle: vi.fn(),
      resolveBundle: vi.fn(),
    },
  },
}));

vi.mock('../hooks/useAssetCache', async importOriginal => ({
  ...(await importOriginal<typeof import('../hooks/useAssetCache')>()),
}));

vi.mock('../suspense/useAssets', async importOriginal => ({
  ...(await importOriginal<typeof import('../suspense/useAssets')>()),
}));

// Clean up after each test
afterEach(() => {
  vi.clearAllMocks();
});
