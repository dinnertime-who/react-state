'use client';

import React from 'react';

export const useMounted = <T extends () => R | Promise<R>, R>(callback: T) => {
  React.useEffect(() => {
    callback();
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
