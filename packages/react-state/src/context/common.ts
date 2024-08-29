type Listner = () => void;

class SignalNameStore {
  private static id = 0;
  private static NAME_PREFIX = 'SC';
  private static HTTP_NAME_PREFIX = `${this.NAME_PREFIX}:Http`;

  static getNextStateName() {
    return `${this.NAME_PREFIX}:${this.id++}`;
  }

  static getNextHttpName() {
    return `${this.HTTP_NAME_PREFIX}:${this.id++}`;
  }
}

export abstract class SignalContext<Snapshot> {
  protected listeners: Listner[] = [];
  protected snapshot: Snapshot;
  public readonly name: string = '';

  constructor(
    protected serverSnapshot: Snapshot, //
    skipName: boolean = false,
  ) {
    this.snapshot = serverSnapshot;
    if (skipName === false) {
      this.name = SignalNameStore.getNextStateName();
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
export abstract class SignalHttpContext<
  T extends readonly SignalContext<unknown>[] | [],
  R,
> {
  public readonly name = SignalNameStore.getNextHttpName();
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
