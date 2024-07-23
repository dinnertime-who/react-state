import { QueryClient } from '@tanstack/react-query';

export const SimpleHttpQueryClient = new QueryClient({
  defaultOptions: { queries: { staleTime: 0, gcTime: 0 } },
});

export class ContextStore {
  private static id = 0;
  private static NAME_PREFIX = 'SC';
  private static GLOBAL_NAME_PREFIX = `${this.NAME_PREFIX}:Glob`;
  private static HTTP_NAME_PREFIX = `${this.NAME_PREFIX}:Http`;

  static getNextStoreName() {
    return `${this.NAME_PREFIX}:${this.id++}`;
  }

  static getNextGlobalStoreName() {
    return `${this.GLOBAL_NAME_PREFIX}:${this.id++}`;
  }

  static getNextHttpStoreName() {
    return `${this.HTTP_NAME_PREFIX}:${this.id++}`;
  }
}
