import { SimpleContext, SimpleHttpContext } from './types';

class SignalContext<T> extends SimpleContext<T> {
  constructor(initialValue: T) {
    super(initialValue);
  }
}

class HttpContext<
  T extends readonly SimpleContext<unknown>[] | [],
  R,
> extends SimpleHttpContext<T, R> {
  constructor(
    callback: (contexts: {
      [P in keyof T]: ReturnType<T[P]['getSnapshot']>;
    }) => R | Promise<R>,
    contexts: T,
    initialData?: Awaited<ReturnType<typeof callback>>,
  ) {
    super(callback, contexts, initialData);
  }
}

class CountContext<T> extends SimpleContext<T> {
  constructor(initialValue: T) {
    super(initialValue, true);
  }
}
export function createCountContext<T>(initialValue: T) {
  return new CountContext(initialValue);
}

export function createSignalState<T>(initialValue: T) {
  return new SignalContext(initialValue);
}

export function createSignalHttp<
  T extends readonly SimpleContext<unknown>[] | [],
  R,
>(
  cb: (contexts: { [P in keyof T]: ReturnType<T[P]['getSnapshot']> }) =>
    | R
    | Promise<R>,
  contexts: T,
  initialData?: Awaited<ReturnType<typeof cb>>,
) {
  return new HttpContext(cb, contexts, initialData);
}

export class ContextStore {
  private static id = 0;
  private static NAME_PREFIX = 'SC';
  private static HTTP_NAME_PREFIX = `${this.NAME_PREFIX}:Http`;

  static getNextStoreName() {
    return `${this.NAME_PREFIX}:${this.id++}`;
  }

  static getNextHttpStoreName() {
    return `${this.HTTP_NAME_PREFIX}:${this.id++}`;
  }
}

export const EMPTY = createSignalState(null);
