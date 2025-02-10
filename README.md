# Pixi React Hooks
> @pixi/react hooks library

## Installation
```sh
# npm
npm i pixi-react-hooks
# yarn
yarn add pixi-react-hooks
# pnpm
pnpm add pixi-react-hooks
```

## Hooks

### useAssets
```tsx
function LoadOne() {
  const {isLoaded, error, data: texture} = useAssets<Texture>('./example.png');

  if (isLoading) return <pixiText text="Loading..." />;
  if (error) return <pixiText text=`Error ${error.message}` />;

  return <pixiSprite texture={texture} />
}

function LoadMany() {
  const {isLoaded, error, data} = useAssets(['./example-1.png', './example-2.png']);
  const texture1: Texture = date['./example-1.png'];
  const texture2: Texture = data['./example-2.png'];

  if (isLoading) return <pixiText text="Loading..." />;
  if (error) return <pixiText text=`Error ${error.message}` />;

  return (
    <pixiContainer>
      <pixiSprite texture={texture1} />
      <pixiSprite texture={texture2} />
    </pixiContainer>
  );
}
```


### useSuspenseAssets
```tsx
function LoadAndSuspend() {
  const texture = useSuspenseAssets<Texture>('./example.png');

  return <pixiSprite texture={texture} />
}

function MyApp() {
  return (
    <ErrorBoundary fallback={<pixiText text="Error">}>
      <Suspense fallback={<pixiText text="Loading...">}>
        <LoadAndSuspend />
      </Suspense>
    </ErrorBoundary>
  )
}
