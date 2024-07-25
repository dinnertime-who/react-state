import { SimpleHttpQueryClient } from '../constants';
import type { SimpleContext, SimpleHttpContext } from '../context/types';

export const prefetchHttpContext = async <
  T extends readonly SimpleContext<unknown>[] | [],
  R,
>(
  httpContext: SimpleHttpContext<T, R>,
) => {
  const queryKey = [
    ...httpContext.getContexts().map((context) => context.getServerSnapshot()),
    httpContext.name,
  ];

  await SimpleHttpQueryClient.prefetchQuery({
    queryKey,
    queryFn: async ({ queryKey }) => {
      const callback = httpContext.getCallback();
      const contexts = queryKey.slice(0, queryKey.length - 1);
      return await callback(
        contexts as { [P in keyof T]: ReturnType<T[P]['getSnapshot']> },
      );
    },
  });
};

export const serverFetchHttpContext = async <
  T extends readonly SimpleContext<unknown>[] | [],
  R,
>(
  httpContext: SimpleHttpContext<T, R>,
) => {
  const queryKey = [
    ...httpContext.getContexts().map((context) => context.getServerSnapshot()),
    httpContext.name,
  ];

  return await SimpleHttpQueryClient.fetchQuery({
    queryKey,
    queryFn: async ({ queryKey }) => {
      const callback = httpContext.getCallback();
      const contexts = queryKey.slice(0, queryKey.length - 1);
      return await callback(
        contexts as { [P in keyof T]: ReturnType<T[P]['getSnapshot']> },
      );
    },
  });
};
