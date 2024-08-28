import { QueryClient } from '@tanstack/react-query';

export const HttpQueryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0, gcTime: 0 } },
});
