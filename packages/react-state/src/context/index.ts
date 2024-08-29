import { SignalContext, SignalHttpContext } from './common';

export class SignalState<T> extends SignalContext<T> {
  constructor(initialValue: T) {
    super(initialValue);
  }
}

export class SignalHttp<
  T extends readonly SignalContext<unknown>[] | [],
  R,
> extends SignalHttpContext<T, R> {
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

// TODO: Signal Store 작업 필요
export abstract class SignalStore<T> extends SignalContext<T> {
  constructor(initialValue: T) {
    super(initialValue);
  }
}

export class SignalMemoryStorage<T> extends SignalStore<T> {
  constructor(initialValue: T) {
    super(initialValue);
  }
}
export class SignalSessionStorage<T> extends SignalStore<T> {
  constructor(initialValue: T) {
    super(initialValue);
  }
}
export class SignalLocalStorage<T> extends SignalStore<T> {
  constructor(initialValue: T) {
    super(initialValue);
  }
}
export class SignalIDBStorage<T> extends SignalStore<T> {
  constructor(initialValue: T) {
    super(initialValue);
  }
}
