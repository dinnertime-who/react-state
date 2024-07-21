import React from 'react';
import { useUnMounted } from '../mounted';

export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
) {
  const handler = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFunction = (...args: Parameters<T>) => {
    if (handler.current) {
      clearTimeout(handler.current);
    }
    handler.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  // Cleanup timeout when unmounting
  useUnMounted(() => {
    if (handler.current) clearTimeout(handler.current);
  });

  return debouncedFunction;
}
