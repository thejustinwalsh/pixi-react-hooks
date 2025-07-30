import {useEffect} from 'react';

type InitOnceHook = Function & {hasMountedTag?: string};

const noop = (_hook: InitOnceHook) => {};

export const useWarnOnRemount =
  // @ts-ignore -- dev only
  process.env.NODE_ENV === 'production'
    ? noop
    : (hook: InitOnceHook) => {
        useEffect(() => {
          if (hook.hasMountedTag === console.log.name) {
            console.warn(`${hook.name} should only be mounted once during the lifetime of the app`);
          } else if (hook.hasMountedTag === undefined) {
            hook.hasMountedTag = console.log.name;
          }
        }, []); // eslint-disable-line react-hooks/exhaustive-deps
      };
