import { useEffect, useMemo, useRef, useState } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';

export type ContextDispatcher<T> = (prevVal: T) => Promise<T> | T;
export type ContextReducer<T> = (prevVal: T) => Promise<Partial<T>> | Partial<T>;

type UseSimpleContextReturn<T, R> = {
  value: T;
  isDispatching: boolean;
  dispatch: R;
  compute: <U>(computeFn: (_data: T) => U) => U;
  effect: (effectFn: (_data: T) => Promise<void> | void) => void;
};

export abstract class SimpleContext<T> {
  constructor(
    protected readonly name: string,
    protected readonly queryClient: QueryClient,
    protected readonly initialValue: T,
  ) {}
  getName() {
    return this.name;
  }
  getQueryClient() {
    return this.queryClient;
  }
  getInitialValue() {
    return this.initialValue;
  }
  clone(): SimpleContext<T> {
    throw new Error('Method Not Implemented');
  }
}

class SimpleScopedContext<T> extends SimpleContext<T> {
  constructor(queryClient: QueryClient, initialValue: T) {
    super(SimpleScopedContext.name, queryClient, initialValue);
  }
  clone(): SimpleContext<T> {
    return new SimpleScopedContext(new QueryClient(), this.initialValue);
  }
}

class SimpleGlobalContext<T> extends SimpleContext<T> {
  constructor(
    queryClient: QueryClient, //
    initialValue: T,
  ) {
    super(crypto.randomUUID(), queryClient, initialValue);
  }
  clone(): SimpleContext<T> {
    return new SimpleGlobalContext(this.queryClient, this.initialValue);
  }
}

class SimpleReducedContext<T> extends SimpleContext<T> {
  private readonly reducerMap = new Map<string, ContextReducer<T>>();

  constructor(queryClient: QueryClient, initialValue: T, initialReducer?: Map<string, ContextReducer<T>>) {
    super(SimpleScopedContext.name, queryClient, initialValue);
    if (initialReducer) this.reducerMap = initialReducer;
  }
  clone(): SimpleContext<T> {
    return new SimpleReducedContext(new QueryClient(), this.initialValue, this.reducerMap);
  }
  registReducer(name: string, reducer: ContextReducer<T>) {
    this.reducerMap.set(name, reducer);
    return this;
  }
  getReducer(name: string, prevVal: T) {
    const reducer = this.reducerMap.get(name);
    if (!reducer) {
      throw new Error('등록되지 않은 reducer를 호출하였습니다.');
    }
    return reducer(prevVal);
  }
}

export const createSimpleContext = <T>(initialValue: T) => {
  return new SimpleScopedContext(new QueryClient(), initialValue);
};

const globalQueryClient = new QueryClient();
export const createGlobalContext = <T>(initialValue: T) => {
  return new SimpleGlobalContext(globalQueryClient, initialValue);
};

export const createReducedContext = <T>(initialValue: T, option: { global: boolean } = { global: false }) => {
  const { global } = option;
  return new SimpleReducedContext(global ? globalQueryClient : new QueryClient(), initialValue);
};

export function useSimpleContext<T>(
  context: SimpleReducedContext<T>,
): UseSimpleContextReturn<T, (name: string) => void>;
export function useSimpleContext<T>(
  context: SimpleContext<T>,
): UseSimpleContextReturn<T, (newValue: T | ContextDispatcher<T>) => void>;
export function useSimpleContext<T>(context: SimpleContext<T>) {
  const [isDispatching, setIsDispatching] = useState(false);
  const { data } = useQuery(
    {
      queryKey: [context.getName()],
      initialData: context.getInitialValue(),
      retryOnMount: false,
      refetchInterval: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      refetchOnWindowFocus: false,
      refetchIntervalInBackground: false,
      staleTime: Infinity,
      gcTime: Infinity,
      retry: 1,
    },
    context.getQueryClient(),
  );

  const dispatch =
    context instanceof SimpleReducedContext
      ? (name: string) => {
          setIsDispatching(true);
          Promise.resolve((context as SimpleReducedContext<T>).getReducer(name, data ?? context.getInitialValue()))
            .then((value) =>
              context
                .getQueryClient()
                .setQueryData(
                  [context.getName()],
                  typeof data === 'object' && !(data instanceof Array) ? { ...data, ...value } : value,
                ),
            )
            .then(() => setIsDispatching(false));
        }
      : (newValue: T | ContextDispatcher<T>) => {
          setIsDispatching(true);
          Promise.resolve(
            typeof newValue === 'function'
              ? (newValue as ContextDispatcher<T>)(data ?? context.getInitialValue())
              : newValue,
          )
            .then((value) => context.getQueryClient().setQueryData([context.getName()], value))
            .then(() => setIsDispatching(false));
        };

  useEffect(() => {
    return () => {
      if (context.getQueryClient() === globalQueryClient) return;
      context.getQueryClient().resetQueries({ queryKey: [context.getName()] });
    };
  }, [context]);

  return {
    value: (data ?? context.getInitialValue()) as T,
    isDispatching,
    dispatch,
    /* eslint-disable */
    compute: <R>(computeFn: (_data: T) => R) =>
      useMemo(() => computeFn(data ?? context.getInitialValue()), [computeFn]),
    /* eslint-disable */
    effect: (effectFn: (_data: T) => Promise<void> | void) =>
      useEffect(() => {
        Promise.resolve(effectFn(data ?? context.getInitialValue()));
      }, [data]),
  };
}

export function useSimpleState<T>(context: SimpleReducedContext<T>): UseSimpleContextReturn<T, (name: string) => void>;
export function useSimpleState<T>(
  context: SimpleContext<T>,
): UseSimpleContextReturn<T, (newValue: T | ContextDispatcher<T>) => void>;
export function useSimpleState<T>(
  initialValue: T,
): UseSimpleContextReturn<T, (newValue: T | ContextDispatcher<T>) => void>;
export function useSimpleState<T>(initialValue: T | SimpleReducedContext<T> | SimpleContext<T>) {
  const context = useRef(
    initialValue instanceof Object && 'clone' in initialValue //
      ? initialValue.clone()
      : createSimpleContext(initialValue),
  );
  return useSimpleContext(context.current);
}

class SimpleHttpContext<R, C> {
  private readonly name: string = crypto.randomUUID();
  constructor(
    private readonly callback: (dependancyState: C[]) => Promise<R> | R,
    private readonly dependancyContext: SimpleContext<C>,
    private readonly queryClient: QueryClient,
  ) {}

  getName() {
    return this.name;
  }
  getDependancy() {
    return this.dependancyContext;
  }
  getCallback() {
    return this.callback;
  }
  getQueryClient() {
    return this.queryClient;
  }
}

export const createSimpleHttpContext = <R, C>(
  callback: (dependancyState: C[]) => Promise<R> | R,
  dependancyContext: SimpleContext<C>,
  option: { isGlobal: boolean } = { isGlobal: false },
) => {
  return new SimpleHttpContext(callback, dependancyContext, option.isGlobal ? globalQueryClient : new QueryClient());
};

export const useSimpleHttpContext = <R, C>(context: SimpleHttpContext<R, C>) => {
  const dependancy = context.getDependancy();
  const callback = context.getCallback();
  const queryClient = context.getQueryClient();
  const name = context.getName();

  const { value: dependancyState } = useSimpleContext(dependancy);

  const { data, refetch, isFetching, error } = useQuery(
    {
      queryKey: [dependancyState, name],
      queryFn: ({ queryKey }) => {
        const state = queryKey.toSpliced(queryKey.length - 1, 1) as C[];
        return callback(state);
      },
    },
    queryClient,
  );

  return {
    value: data as R | undefined,
    refetch: (() => {
      refetch();
    }) as () => Promise<void>,
    isFetching: isFetching as boolean,
    error: error as Error | null,
    effect: (effectFn: (_data: R | undefined) => Promise<void> | void) => {
      // eslint-disable-next-line
      useEffect(() => {
        Promise.resolve(effectFn(data));
        // eslint-disable-next-line
      }, [data]);
    },
    compute: <CR>(computeFn: (_data: R | undefined) => CR) => {
      // eslint-disable-next-line
      return useMemo(() => computeFn(data), [data]);
    },
  };
};
