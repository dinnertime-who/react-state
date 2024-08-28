import { ContextStore } from '.';

type Listner = () => void;

export type StateDispatcher<Snapshot> = (prev: Snapshot) => Snapshot;

export type StatePromiseDispatcher<Snapshot> = (
  prev: Snapshot,
) => Promise<Snapshot>;

export abstract class SimpleContext<Snapshot> {
  protected listeners: Listner[] = [];
  protected snapshot: Snapshot;
  public readonly name: string = '';

  constructor(
    protected serverSnapshot: Snapshot, //
    skipName: boolean = false,
  ) {
    this.snapshot = serverSnapshot;
    if (skipName === false) {
      this.name = ContextStore.getNextStoreName();
    }
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
    return this.serverSnapshot;
  }

  cleanSnapshot() {
    this.snapshot = this.serverSnapshot;
  }

  emitChange() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

// eslint-disable-next-line
type InitialData<ID> = ID extends Function ? never : ID;
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
    protected readonly initialData?: Awaited<ReturnType<typeof callback>>,
  ) {}

  getCallback() {
    return this.callback;
  }
  getContexts() {
    return this.contexts as {
      [P in keyof T]: T[P];
    };
  }
  getInitialData() {
    return this.initialData as InitialData<R>;
  }
}
