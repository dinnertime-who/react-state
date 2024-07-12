import { useEffect, useMemo, useRef } from 'react';
import { QueryClient, useQuery } from '@tanstack/react-query';

export type SimpleContext<T> = {
  getName(): string;
  getQueryClient(): QueryClient;
  getInitialValue(): T;
};

class SimpleScopedContext<T> implements SimpleContext<T> {
  constructor(
    private readonly name: string, //
    private readonly queryClient: QueryClient,
    private readonly initialValue: T,
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
}

class SimpleGlobalContext<T> implements SimpleContext<T> {
  private readonly name = crypto.randomUUID();
  constructor(private readonly queryClient: QueryClient, private readonly initialValue: T) {}

  getName() {
    return this.name;
  }
  getQueryClient() {
    return this.queryClient;
  }
  getInitialValue() {
    return this.initialValue;
  }
}

export const createSimpleContext = <T>(initialValue: T): SimpleContext<T> => {
  return new SimpleScopedContext(SimpleScopedContext.name, new QueryClient(), initialValue);
};

const globalQueryClient = new QueryClient();

export const createGlobalContext = <T>(initialValue: T): SimpleContext<T> => {
  return new SimpleGlobalContext(globalQueryClient, initialValue);
};

export const useSimpleContext = <T>(context: SimpleContext<T>) => {
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

  const setData = (newValue: (prevVal: T) => Promise<T> | T) => {
    Promise.resolve(newValue(data || context.getInitialValue())).then((value) =>
      context.getQueryClient().setQueryData([context.getName()], value),
    );
  };

  useEffect(() => {
    return () => {
      if (context instanceof SimpleGlobalContext) return;
      context.getQueryClient().resetQueries({ queryKey: [context.getName()] });
    };
  }, [context]);

  return {
    value: (data || context.getInitialValue()) as T,
    set: setData,
    /* eslint-disable */
    compute: <R>(computeFn: (_data: T) => R) =>
      useMemo(() => computeFn(data || context.getInitialValue()), [computeFn]),
    /* eslint-disable */
    effect: (effectFn: (_data: T) => Promise<void> | void) =>
      useEffect(() => {
        effectFn(data || context.getInitialValue());
      }, [effectFn]),
  };
};

export const useSimpleState = <T>(initialValue: T) => {
  const context = useRef(createSimpleContext(initialValue));
  return useSimpleContext(context.current);
};
