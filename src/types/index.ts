export type AssetState<T> =
  | {
      status: 'pending';
      isLoaded: false;
      error: Error | null;
      data: null;
    }
  | {
      status: 'loaded';
      isLoaded: true;
      error: null;
      data: T;
    }
  | {
      status: 'error';
      isLoaded: false;
      error: Error;
      data: null;
    };

export type HookState<T> = {
  thenable: Promise<T> | null;
  key: Set<string>;
};
