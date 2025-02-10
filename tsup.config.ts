import { defineConfig } from 'tsup'

export default defineConfig({
  entry: ['src/useAssets.ts'],
  format: ['cjs', 'esm'],
  dts: true,
  sourcemap: true,
  clean: true,
});
