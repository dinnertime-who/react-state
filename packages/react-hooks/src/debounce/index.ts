'use client';
import React from 'react';
import { useUnmounted } from '../mounted';

export function useDebounce<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
) {
  // debounce 함수 ref
  const handler = React.useRef<ReturnType<typeof setTimeout> | null>(null);

  const debouncedFunction = (...args: Parameters<T>) => {
    // handler가 있는 경우 timeout 종료
    if (handler.current) clearTimeout(handler.current);

    // 새로운 timeout 생성 및 실행
    handler.current = setTimeout(() => {
      callback(...args);
    }, delay);
  };

  // unmount 시 timeout 종료
  useUnmounted(() => {
    if (handler.current) clearTimeout(handler.current);
  });

  return debouncedFunction;
}
