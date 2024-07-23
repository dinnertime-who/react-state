'use client';

import { SimpleHttpQueryClient } from '../constants';
import { QueryClientProvider } from '@tanstack/react-query';

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
