import { ContextStore } from '../constants';

type Listner = () => void;

export type SnapshotDispatcher<Snapshot> = (prev: Snapshot) => Snapshot;

export type SnapshotPromiseDispatcher<Snapshot> = (
  prev: Snapshot,
) => Promise<Snapshot>;

export abstract class SimpleContext<Snapshot> {
  protected listeners: Listner[] = [];
  protected snapshot: Snapshot;
  public readonly name: string;

  constructor(
    protected readonly initialValue: Snapshot, //
    public readonly scope: 'global' | 'scoped',
  ) {
    this.snapshot = initialValue;
    this.name =
      scope === 'global'
        ? ContextStore.getNextGlobalStoreName()
        : ContextStore.getNextStoreName();
  }

  subscribe(listener: Listner) {
    this.listeners = [listener, ...this.listeners];
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  setSnapshot(newSnapshot: Snapshot) {
    this.snapshot = newSnapshot;
    this.emitChange();
  }

  getSnapshot() {
    return this.snapshot;
  }

  getServerSnapshot() {
    return this.initialValue;
  }

  cleanSnapshot() {
    this.snapshot = this.initialValue;
  }

  emitChange() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export abstract class SimpleHttpContext<
  T extends readonly SimpleContext<unknown>[] | [],
  R,
> {
  public readonly name = ContextStore.getNextHttpStoreName();
  constructor(
    protected readonly callback: (contexts: {
      [P in keyof T]: ReturnType<T[P]['getSnapshot']>;
    }) => R | Promise<R>,
    protected readonly contexts: T,
  ) {}

  getCallback() {
    return this.callback;
  }
  getContexts() {
    return this.contexts as {
      [P in keyof T]: T[P];
    };
  }
}
