'use client';

import * as React from 'react';
import type {
  SnapshotDispatcher,
  SnapshotPromiseDispatcher,
  SimpleContext,
  SimpleHttpContext,
} from '../context/types';
import { createCountContext } from '../context';
import { useQuery } from '@tanstack/react-query';
import { SimpleHttpQueryClient } from '../constants';

const createdCount = createCountContext<Map<string, number>>(new Map());

function useContextCount<T>(context: SimpleContext<T>) {
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

export function useSimpleContext<T>(context: SimpleContext<T>) {
  const [isDispatching, setIsDispatching] = React.useState(false);
  const { decrease, increase, getCount } = useContextCount(context);

  React.useEffect(() => {
    if (context.scope === 'scoped') increase();

    return () => {
      if (context.scope === 'scoped') {
        decrease();
        if (getCount() === 0) context.cleanSnapshot();
      }
    };
  }, []);

  const snapshot = React.useSyncExternalStore(
    (l) => context.subscribe(l),
    () => context.getSnapshot(),
    () => context.getServerSnapshot(),
  );

  function dispatch(newSnap: T): void;
  function dispatch(newSnap: SnapshotDispatcher<T>): void;
  function dispatch(newSnap: SnapshotPromiseDispatcher<T>): void;
  function dispatch(
    newSnap: T | SnapshotDispatcher<T> | SnapshotPromiseDispatcher<T>,
  ) {
    if (isDispatching === true) return;
    setIsDispatching(true);

    new Promise((resolve) => {
      if (typeof newSnap !== 'function') {
        resolve(newSnap as T);
      } else {
        resolve((newSnap as SnapshotPromiseDispatcher<T>)(snapshot));
      }
    })
      .then((newSnap) => {
        context.setSnapshot(newSnap as Awaited<T>);
      })
      .catch((error) => {
        console.error(error);
      })
      .finally(() => {
        setIsDispatching(false);
      });
  }

  const effect = (fn: (prevSnap: T) => any | Promise<any>) => {
    React.useEffect(() => {
      fn(snapshot);
    }, [snapshot]);
  };

  const compute = <R>(fn: (prevSnap: T) => R) => {
    return React.useMemo(() => fn(snapshot), [snapshot]);
  };

  return {
    value: snapshot,
    isDispatching,
    dispatch,
    effect,
    compute,
  };
}

export function useMergedContext<
  T extends readonly SimpleContext<unknown>[] | [],
>(...contexts: T) {
  const hooks = contexts.map((context) => useSimpleContext(context));

  const effect = (
    fn: (
      ...args: { [P in keyof T]: ReturnType<T[P]['getSnapshot']> }
    ) => any | Promise<any>,
  ) => {
    React.useEffect(() => {
      fn(
        ...(hooks.map((hook) => hook.value) as {
          [P in keyof T]: ReturnType<T[P]['getSnapshot']>;
        }),
      );
    }, hooks);
  };

  const compute = <Ret>(
    fn: (...args: { [P in keyof T]: ReturnType<T[P]['getSnapshot']> }) => Ret,
  ) => {
    return React.useMemo(
      () =>
        fn(
          ...(hooks.map((hook) => hook.value) as {
            [P in keyof T]: ReturnType<T[P]['getSnapshot']>;
          }),
        ),
      hooks,
    );
  };

  const isDispatching = React.useMemo(
    () => hooks.some((hook) => hook.isDispatching),
    hooks,
  );

  return {
    effect,
    compute,
    isDispatching,
  };
}

export function useHttpContext<
  T extends readonly SimpleContext<unknown>[] | [],
  R,
>(context: SimpleHttpContext<T, R>) {
  const hooks = context
    .getContexts()
    .map((context) => useSimpleContext(context));

  const queryKey = [...hooks.map(({ value }) => value), context.name];

  const { data, isFetching, isLoading, isRefetching, isPending } = useQuery({
    queryKey,
    queryFn: async ({ queryKey }) => {
      console.log(queryKey);
      const callback = context.getCallback();
      const contexts = queryKey.slice(0, queryKey.length - 1);
      return await callback(
        contexts as { [P in keyof T]: ReturnType<T[P]['getSnapshot']> },
      );
    },
    placeholderData: (previousData) => previousData || context.getInitialData(),
    refetchInterval: false,
    refetchOnMount: false,
    refetchIntervalInBackground: false,
    refetchOnReconnect: false,
    refetchOnWindowFocus: false,
    retryOnMount: false,
    staleTime: Infinity,
    gcTime: Infinity,
  });

  const effect = (fn: (prevData: typeof data) => any | Promise<any>) =>
    React.useEffect(() => {
      fn(data);
    }, [data]);

  const compute = <R>(fn: (prevData: typeof data) => R) =>
    React.useMemo(() => fn(data), [data]);

  const invalidate = () =>
    SimpleHttpQueryClient.invalidateQueries({ queryKey });

  return {
    value: data,
    effect,
    compute,
    isFetching: React.useMemo(
      () => isFetching || isLoading || isRefetching || isPending,
      [isFetching, isLoading, isRefetching, isPending],
    ),
    invalidate,
  };
}
