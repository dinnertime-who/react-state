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
    this.emitChange();
  }

  emitChange() {
    for (const listener of this.listeners) {
      listener();
    }
  }
}

export class ContextStore {
  private static id = 0;
  private static NAME_PREFIX = 'SC';
  private static GLOBAL_NAME_PREFIX = `${this.NAME_PREFIX}:Glob`;

  static getNextStoreName() {
    return `${this.NAME_PREFIX}:${this.id++}`;
  }

  static getNextGlobalStoreName() {
    return `${this.GLOBAL_NAME_PREFIX}:${this.id++}`;
  }
}
