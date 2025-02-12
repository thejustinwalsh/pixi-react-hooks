export type AssetState<T> = {
  isLoaded: boolean;
  error: Error | null;
  data: T;
};

export type HookState<T> = {
  thenable?: Promise<T>;
  key: Set<string>;
};
