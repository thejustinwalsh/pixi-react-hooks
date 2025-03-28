import {useEffect, useId} from 'react';

type InitOnceHook = Function & {hasMountedTag?: string};

export const useWarnOnRemount =
  // @ts-ignore -- dev only
  process.env.NODE_ENV === 'production'
    ? (_hook: InitOnceHook) => {}
    : (hook: InitOnceHook) => {
        const tag = useId();
        useEffect(() => {
          if (hook.hasMountedTag === tag) {
            console.warn(`${hook.name} should only be mounted once during the lifetime of the app`);
          }
          hook.hasMountedTag = tag;
        }, []); // eslint-disable-line react-hooks/exhaustive-deps
      };
