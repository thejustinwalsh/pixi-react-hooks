import {useEffect} from 'react';

type InitOnceHook = Function & {hasMountedTag?: string};

export const useWarnOnRemount =
  // @ts-ignore -- dev only
  process.env.NODE_ENV === 'production'
    ? (_hook: InitOnceHook) => {}
    : (hook: InitOnceHook) => {
        useEffect(() => {
          if (hook.hasMountedTag === console.log.name) {
            console.warn(`${hook.name} should only be mounted once during the lifetime of the app`);
          }
          hook.hasMountedTag = console.log.name;
        }, []); // eslint-disable-line react-hooks/exhaustive-deps
      };
