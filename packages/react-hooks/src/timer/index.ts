'use client';
import React from 'react';

export function useTimeout<R>(callback: () => R, time: number) {
  React.useEffect(() => {
    const timeout = setTimeout(() => {
      callback();
    }, time);

    return () => {
      clearTimeout(timeout);
    };
  }, [callback]);
}

export function useInterval<R>(callback: () => R, time: number) {
  React.useEffect(() => {
    const interval = setInterval(() => {
      callback();
    }, time);

    return () => {
      clearInterval(interval);
    };
  }, [callback]);
}
