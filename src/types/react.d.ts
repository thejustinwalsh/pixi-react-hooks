import 'react';

declare module 'react' {
  export function unstable_getCacheForType<T>(resourceType: () => T): T;
}
