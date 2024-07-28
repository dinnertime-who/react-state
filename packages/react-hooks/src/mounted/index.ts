'use client';
import React from 'react';

export const useMounted = (executor: () => any | Promise<any>) => {
  React.useEffect(() => {
    executor();
  }, []);
};

export const useUnmounted = (executor: () => any | Promise<any>) => {
  React.useEffect(() => {
    return () => {
      executor();
    };
  }, []);
};
