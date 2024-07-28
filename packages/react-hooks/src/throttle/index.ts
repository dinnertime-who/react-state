'use client';
import React from 'react';

export function useThrottle<T extends (...args: any[]) => void>(
  callback: T,
  delay: number,
) {
  // 마지막으로 실행된 시간
  const lastCall = React.useRef<number>(0);
  // callback 함수를 ref로 관리
  const savedCallback = React.useRef<T>(callback);

  // callback함수가 update될때 마다 ref update
  React.useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  const throttledFunction = React.useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      // 현재 실행시간과 마지막 실행 시간의 차이가 delay보다 크거나 같은 경우
      if (now - lastCall.current >= delay) {
        // callback 실행, 마지막 실행 시간 update
        savedCallback.current(...args);
        lastCall.current = now;
      }
    },
    [delay],
  );

  return throttledFunction;
}
