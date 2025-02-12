# Pixi React Hooks

> @pixi/react hooks library

## Installation

```sh
# npm
npm i git+https://github.com/thejustinwalsh/pixi-react-hooks.git
# yarn
yarn add git+https://github.com/thejustinwalsh/pixi-react-hooks.git
# pnpm
pnpm add git+https://github.com/thejustinwalsh/pixi-react-hooks.git
```

## Hooks

### useAssets

```tsx
import {useAssets} from 'pixi-react-hooks';

function LoadOne() {
  const {isLoaded, error, data: texture} = useAssets<Texture>('./example.png');

  if (isLoading) return <pixiText text="Loading..." />;
  if (error) return <pixiText text={`Error ${error.message}`} />;

  return <pixiSprite texture={texture} />;
}

// Load multiple assets
function LoadMany() {
  const {isLoaded, error, data} = useAssets(['./example-1.png', './example-2.png']);

  if (isLoading) return <pixiText text="Loading..." />;
  if (error) return <pixiText text={`Error ${error.message}`} />;

  return (
    <pixiContainer>
      {Object.entries(data).map(([path, texture]) => (
        <pixiSprite key={path} texture={texture} />
      ))}
    </pixiContainer>
  );
}
```

### suspense/useAssets

```tsx
import { useAssets } from 'pixi-react-hooks/suspense';

// Basic suspense usage
function LoadAndSuspend() {
  const texture = useAssets<Texture>('./example.png');

  return <pixiSprite texture={texture} />
}

// Handling multiple assets with suspense
function LoadManyWithSuspense() {
  const textures = useAssets([
    './texture1.png',
    './texture2.png',
    './texture3.png'
  ]);

  return (
    <pixiContainer>
      {Object.entries(textures).map(([path, texture]) => (
        <pixiSprite key={path} texture={texture} />
      ))}
    </pixiContainer>
  );
}

// Complete app setup with error boundary
function MyApp() {
  return (
    <ErrorBoundary fallback={<pixiText text="Error">}>
      <Suspense fallback={<pixiText text="Loading...">}>
        <LoadAndSuspend />
      </Suspense>
    </ErrorBoundary>
  )
}
```
