import { MOBILE_AGENT_REGEX } from './constants';
import { Primitives, SerializableObject } from './types';

export function isWindowSafe() {
  return typeof window !== 'undefined';
}

export function isDocumentSafe() {
  return typeof document !== 'undefined';
}

export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isMobile() {
  if (!isWindowSafe() || !window.navigator || !window.navigator.userAgent)
    return false;
  return MOBILE_AGENT_REGEX.test(window.navigator.userAgent);
}

export function getDocumentCookie(name: string) {
  if (!isDocumentSafe() || !document.cookie) return '';

  // Chat Gpt로 작성된 코드입니다.
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);

  if (parts.length === 2) return parts.pop()?.split(';').shift() || '';
  return '';
}

export function safeDivide(
  a: number,
  b: number,
  { parseInt = false }: { parseInt: boolean },
) {
  if (b === 0) {
    throw new Error('Division by zero is not allowed');
  }

  const result = a / b;

  if (!parseInt) return result;
  return Number.isInteger(result) ? result : Math.ceil(result);
}

export class TypedPromise {
  static async allSettled<T extends readonly unknown[] | []>(promiseList: T) {
    const settled = await Promise.allSettled(promiseList);

    return {
      fullfiled: settled.filter((value) => value.status === 'fulfilled') as {
        -readonly [P in keyof T]: PromiseFulfilledResult<Awaited<T[P]>>;
      },
      rejected: settled.filter((value) => value.status === 'rejected') as {
        -readonly [P in keyof T]: PromiseRejectedResult;
      },
      settled,
    };
  }
}

export class UtilArray {
  static removeDuplicates<T extends Primitives[]>(array: T): T;
  static removeDuplicates<T extends SerializableObject[]>(
    array: T,
    keys: (keyof T[number])[],
  ): T;
  static removeDuplicates<T extends Primitives[] | SerializableObject[]>(
    array: T,
    keys?: (keyof T[number])[],
  ) {
    // Primitives Array 인 경우 ( typeguard로 타입 안정성 높임 )
    if (this.isPrimitivesArray(array)) {
      return this.removeDuplicatesPrimitivesArray(array);
    }
    return this.removeDuplicatesRecordArray(array, keys! as string[]);
  }

  // 배열의 모든 원소가 Primitives(string | number | boolean | null | undefined)인지 확인
  static isPrimitivesArray(array: unknown[]): array is Primitives[] {
    return typeof array[0] !== 'object';
  }

  private static removeDuplicatesPrimitivesArray(array: Primitives[]) {
    // Set으로 중복제거
    return Array.from(new Set(array));
  }

  private static removeDuplicatesRecordArray<T extends SerializableObject[]>(
    array: T,
    keys: (keyof T[number])[],
  ) {
    // 중복 값 확인할 key 생성
    const makeKey = (item: T[number]) =>
      keys.reduce((acc, cur) => `${String(acc)}_${String(item[cur])}`, '');

    return Array.from(
      new Map(array.map((item) => [makeKey(item), item])).values(),
    );
  }
}
