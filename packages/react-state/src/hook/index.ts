'use client';

import * as React from 'react';
import { SignalContext } from '../context/common';
import { useQuery } from '@tanstack/react-query';
import { HttpQueryClient } from '../constants';
import {
  useComputor,
  useContextCount,
  useDispatcher,
  useEffector,
} from './common';
import { SignalHttp, SignalState } from '../context';

export type UseSignalState = ReturnType<typeof useSignalState>;
export type UseSignalSignalHttp = ReturnType<typeof useSignalHttp>;

export type StateDispatcher<Snapshot> = (prev: Snapshot) => Snapshot;

export type StatePromiseDispatcher<Snapshot> = (
  prev: Snapshot,
) => Promise<Snapshot>;

export function useSignalState<T>(context: SignalState<T>) {
  const { decrease, increase, getCount } = useContextCount(context);
  React.useEffect(() => {
    increase();
    return () => {
      decrease();
      if (getCount() === 0) context.cleanSnapshot();
    };
  }, []);

  const snapshot = React.useSyncExternalStore(
    (l) => context.subscribe(l),
    () => context.getSnapshot(),
    () => context.getServerSnapshot(),
  );

  const { dispatch, isDispatching } = useDispatcher(
    snapshot, //
    (newSnapshot) => context.setSnapshot(newSnapshot),
  );
  const { effect } = useEffector(snapshot);
  const { compute } = useComputor(snapshot);

  return {
    value: snapshot,
    isDispatching,
    dispatch,
    effect,
    compute,
  };
}

export function useSignalHttp<
  T extends readonly SignalContext<unknown>[] | [],
  R,
>(context: SignalHttp<T, R>) {
  const hooks = context.getContexts().map((context) => useSignalState(context));
  const queryKey = [context.name];

  const { data, isFetching, isLoading, isRefetching, isPending, refetch } =
    useQuery(
      {
        queryKey,
        queryFn: async () => {
          const callback = context.getCallback();
          return await callback([...hooks.map(({ value }) => value)] as {
            [P in keyof T]: ReturnType<T[P]['getSnapshot']>;
          });
        },
        placeholderData: (previousData) => {
          return previousData || context.getInitialData();
        },
        refetchInterval: false,
        refetchIntervalInBackground: false,
        refetchOnReconnect: false,
        refetchOnWindowFocus: false,
        retryOnMount: false,
        refetchOnMount: false,
        gcTime: Infinity,
      },
      HttpQueryClient,
    );

  const { effect } = useEffector(data);
  const { compute } = useComputor(data);

  const invalidate = () => {
    HttpQueryClient.invalidateQueries({ queryKey });
  };

  return {
    value: data,
    effect,
    compute,
    isFetching: React.useMemo(
      () => isFetching || isLoading || isRefetching || isPending,
      [isFetching, isLoading, isRefetching, isPending],
    ),
    refetch,
    invalidate,
  };
}
