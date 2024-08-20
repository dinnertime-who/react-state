'use client';

import React from 'react';

export const useMounted = <T extends () => R | Promise<R>, R>(callback: T) => {
  const mountedRef = React.useRef(false);

  React.useEffect(() => {
    if (!mountedRef.current) {
      mountedRef.current = true;
      callback();
    }
  }, []);
};

export const useUnmounted = <T extends () => R | Promise<R>, R>(
  callback: T,
) => {
  React.useEffect(() => {
    return () => {
      callback();
    };
  }, []);
};
