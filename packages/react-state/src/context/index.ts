import { SimpleContext, SimpleHttpContext } from './types';

class GlobalContext<T> extends SimpleContext<T> {
  constructor(initialValue: T) {
    super(initialValue, 'global');
  }
}

class ScopedContext<T> extends SimpleContext<T> {
  constructor(initialValue: T) {
    super(initialValue, 'scoped');
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
  ) {
    super(callback, contexts);
  }
}

export function createSimpleContext<T>(initialValue: T) {
  return new ScopedContext(initialValue);
}

export function createGlobalContext<T>(initialValue: T) {
  return new GlobalContext(initialValue);
}

export function createHttpContext<
  T extends readonly SimpleContext<unknown>[] | [],
  R,
>(
  cb: (contexts: { [P in keyof T]: ReturnType<T[P]['getSnapshot']> }) =>
    | R
    | Promise<R>,
  contexts: T,
) {
  return new HttpContext(cb, contexts);
}
