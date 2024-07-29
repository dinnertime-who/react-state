export type Primitives = string | number | boolean | null | undefined;

export type SerializablePrimitives = Primitives | Date;

export type Serializable =
  | SerializablePrimitives
  | Serializable[]
  | { [key: string]: Serializable }
  | {
      [key: string]:
        | SerializablePrimitives
        | Serializable[]
        | { [key: string]: Serializable };
    };

export type SerializableObject = Record<string, Serializable>;
