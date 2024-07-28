'use client';

import { isWindowSafe } from '@dinnertime/utils';
import React from 'react';

type Listner = () => void;

let listeners: Listner[] = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

const store = {
  subscribe(listener: Listner) {
    listeners = [...listeners, listener];
    return () => {
      listeners = listeners.filter((l) => l !== listener);
    };
  },
  getSnapshot(key: string) {
    return isWindowSafe() ? window.localStorage.getItem(key) : null;
  },
};

export function useLocalStorage<T>(key: string) {
  const [isDispatching, setIsDispatching] = React.useState(false);

  const data = React.useSyncExternalStore(
    store.subscribe,
    () => store.getSnapshot(key),
    () => null,
  );

  const dispatch = (
    value:
      | (T | null)
      | ((newValue: T | null) => T | null)
      | ((newValue: T | null) => Promise<T | null>),
  ) => {
    if (!isWindowSafe()) return;
    if (isDispatching) return;
    setIsDispatching(true);

    new Promise((resolve) => {
      if (typeof value !== 'function') {
        resolve(value as T | null);
      } else {
        resolve(
          (value as (newValue: T | null) => Promise<T | null>)(
            data === null ? null : (JSON.parse(data || '') as T),
          ),
        );
      }
    })
      .then((newValue) => {
        if (newValue === null) {
          window.localStorage.removeItem(key);
        } else {
          window.localStorage.setItem(key, JSON.stringify(newValue));
        }
        emitChange();
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsDispatching(false);
      });
  };

  const effect = (fn: (data: T | null) => any | Promise<any>) =>
    React.useEffect(() => {
      try {
        fn(data === null ? null : (JSON.parse(data || '') as T));
      } catch (error) {
        window.localStorage.removeItem(key);
        console.error(error);
      }
    }, [data]);

  const compute = <R>(fn: (data: T | null) => R) =>
    React.useMemo(() => {
      try {
        fn(data === null ? null : (JSON.parse(data || '') as T));
      } catch (error) {
        window.localStorage.removeItem(key);
        console.error(error);
      }
    }, [data]);

  return {
    value: compute((data) => data),
    isDispatching,
    dispatch,
    effect,
    compute,
  };
}
