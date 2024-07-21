import { SimpleContext } from './types';

class SimpleGlobalContext<T> extends SimpleContext<T> {
  constructor(initialValue: T) {
    super(initialValue, 'global');
  }
}

class SimpleScopedContext<T> extends SimpleContext<T> {
  constructor(initialValue: T) {
    super(initialValue, 'scoped');
  }
}

export function createScopedContext<T>(initialValue: T) {
  return new SimpleScopedContext(initialValue);
}
export function createGlobalContext<T>(initialValue: T) {
  return new SimpleGlobalContext(initialValue);
}
