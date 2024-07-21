'use client';

import React from 'react';

function getSnapshot() {
  return window.navigator.onLine;
}

function getSeverSnapshot() {
  return true;
}

function subscribe(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

export function useOnlineStatus() {
  return React.useSyncExternalStore(subscribe, getSnapshot, getSeverSnapshot);
}
