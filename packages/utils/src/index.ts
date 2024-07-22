import { MOBILE_AGENT_REGEX } from './constants';

export function isWindowSafe() {
  if (typeof window === 'undefined') return false;
  return true;
}

export function isDocumentSafe() {
  if (typeof document === 'undefined') return false;
  return true;
}

export async function wait(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function isMobile() {
  if (typeof window === 'undefined') return false;
  if (!window.navigator || !window.navigator.userAgent) return false;
  return MOBILE_AGENT_REGEX.test(window.navigator.userAgent);
}

export function getDocumentCookie(name: string) {
  if (typeof document === 'undefined') return '';
  if (!document.cookie) return '';

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
        [P in keyof T]: PromiseFulfilledResult<Awaited<T[P]>>;
      },
      rejected: settled.filter((value) => value.status === 'rejected') as {
        [P in keyof T]: PromiseRejectedResult;
      },
      settled,
    };
  }
}
