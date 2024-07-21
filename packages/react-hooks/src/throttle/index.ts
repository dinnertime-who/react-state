'use client';
import { useRef, useCallback, useEffect } from 'react';

export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
) {
  const lastCall = useRef<number>(0);
  const savedCallback = useRef<T>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const throttledFunction = useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastCall.current >= delay) {
        savedCallback.current(...args);
        lastCall.current = now;
      }
    },
    [delay],
  );

  return throttledFunction;
}
