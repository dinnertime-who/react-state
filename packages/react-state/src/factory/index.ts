import {
  SignalHttp,
  SignalIDBStorage,
  SignalLocalStorage,
  SignalMemoryStorage,
  SignalSessionStorage,
  SignalState,
  SignalStore,
} from '../context';
import { SignalContext } from '../context/common';

export function createSignalState<T>(initialValue: T) {
  return new SignalState(initialValue);
}

export function createSignalHttp<
  T extends readonly SignalContext<unknown>[] | [],
  R,
>(
  cb: (contexts: { [P in keyof T]: ReturnType<T[P]['getSnapshot']> }) =>
    | R
    | Promise<R>,
  contexts: T,
  initialData?: Awaited<ReturnType<typeof cb>>,
) {
  return new SignalHttp(cb, contexts, initialData);
}

export type SignalStoreOption = {
  mode: 'memory' | 'sessionStorage' | 'localStorage' | 'indexedDB';
};
export function createSignalStore<T>(
  initialValue: T,
  option: SignalStoreOption,
): SignalStore<T> {
  if (option.mode === 'memory') {
    return new SignalMemoryStorage(initialValue);
  }
  if (option.mode === 'sessionStorage') {
    return new SignalSessionStorage(initialValue);
  }
  if (option.mode === 'localStorage') {
    return new SignalLocalStorage(initialValue);
  }
  if (option.mode === 'indexedDB') {
    return new SignalIDBStorage(initialValue);
  }
  throw new Error(`Invalid Option`);
}
