'use client';

import { SimpleHttpQueryClient } from '../constants';
import {
  HydrationBoundary,
  type QueryClient,
  QueryClientProvider,
  dehydrate as reactQueryDehydrate,
} from '@tanstack/react-query';

export function SimpleHttpQueryProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <QueryClientProvider client={SimpleHttpQueryClient}>
      {children}
    </QueryClientProvider>
  );
}

export function SimpleHttpPrefetchBoundary({
  children,
  state,
}: {
  children: React.ReactNode;
  state?: unknown;
}) {
  return <HydrationBoundary state={state}>{children}</HydrationBoundary>;
}

export function dehydrate(queryClient: QueryClient) {
  return reactQueryDehydrate(queryClient);
}
