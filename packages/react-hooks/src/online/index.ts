'use client';

import React from 'react';

// React 공식문서의 useSyncExternalStore 예시를 그대로 가져옴
// https://ko.react.dev/reference/react/useSyncExternalStore#subscribing-to-a-browser-api
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
