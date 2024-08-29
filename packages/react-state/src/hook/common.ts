'use client';

import * as React from 'react';
import { SignalContext } from '../context/common';
import { StateDispatcher, StatePromiseDispatcher } from './index';

class CountState<T> extends SignalContext<T> {
  constructor(initialValue: T) {
    super(initialValue, true);
  }
}
const createdCount = createCountState<Map<string, number>>(new Map());

function createCountState<T>(initialValue: T) {
  return new CountState(initialValue);
}

export function useContextCount<T>(context: SignalContext<T>) {
  const countStore = React.useSyncExternalStore(
    (l) => createdCount.subscribe(l),
    () => createdCount.getSnapshot(),
    () => createdCount.getServerSnapshot(),
  );

  return {
    getCount: () => {
      return countStore.get(context.name)!;
    },
    increase: () => {
      countStore.set(
        context.name,
        Math.min(
          (countStore.get(context.name) || 0) + 1,
          Number.MAX_SAFE_INTEGER,
        ),
      );
      createdCount.emitChange();
    },
    decrease: () => {
      countStore.set(
        context.name,
        Math.max((countStore.get(context.name) || 0) - 1, 0),
      );
      createdCount.emitChange();
    },
  };
}

export function useDispatcher<T>(
  snapshot: T,
  setSnapshot: (newSnapshot: T) => void,
) {
  const [isDispatching, setIsDispatching] = React.useState(false);

  function dispatch(
    newSnap: T | StateDispatcher<T> | StatePromiseDispatcher<T>,
  ) {
    if (isDispatching === true) return;
    setIsDispatching(true);

    new Promise((resolve) => {
      if (typeof newSnap !== 'function') {
        resolve(newSnap as T);
      } else {
        resolve((newSnap as StatePromiseDispatcher<T>)(snapshot));
      }
    })
      .then((newSnap) => {
        setSnapshot(newSnap as Awaited<T>);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsDispatching(false);
      });
  }

  return { dispatch, isDispatching };
}

export function useEffector<T>(snapshot: T) {
  const effect = <R>(fn: (prevSnap: T) => R | Promise<R>) => {
    React.useEffect(() => {
      fn(snapshot);
    }, [snapshot]);
  };

  return { effect };
}

export function useComputor<T>(snapshot: T) {
  const compute = <R>(fn: (prevSnap: T) => R) => {
    return React.useMemo(() => fn(snapshot), [snapshot]);
  };

  return { compute };
}
