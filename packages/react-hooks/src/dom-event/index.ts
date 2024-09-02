'use client';

import React from 'react';
import { type Observable, type OperatorFunction, fromEvent } from 'rxjs';
import { debounceTime, take, throttleTime } from 'rxjs/operators';
import { isDocumentSafe } from '@dinnertime/utils';

type EventOption =
  | ({ once?: boolean } & { debounce?: never; throttle?: never })
  | ({ once?: boolean } & { debounce?: number; throttle?: never })
  | ({ once?: boolean } & { throttle?: number; debounce?: never });

const buildOperators = (option?: EventOption) => {
  const pipeOperators = [] as unknown as [OperatorFunction<any, any>];
  if (option?.debounce !== undefined) {
    pipeOperators.push(debounceTime(option.debounce));
  }
  if (option?.throttle !== undefined) {
    pipeOperators.push(throttleTime(option.throttle));
  }
  if (option?.once) {
    pipeOperators.push(take(1));
  }

  return pipeOperators;
};

const useEvent = <El extends HTMLElement>(
  target: El | null,
  eventName: keyof HTMLElementEventMap,
  callback: (e: Event) => void,
  option?: EventOption,
) => {
  const eventCallback = React.useCallback(callback, [callback]);

  React.useEffect(() => {
    if (!target) return;

    const pipeOperators = buildOperators(option);

    const event$: Observable<Event> = fromEvent(target, eventName);
    const eventExecuted$ = event$.pipe(...pipeOperators);
    const subscription = eventExecuted$.subscribe((e) => {
      eventCallback(e);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, [target, eventCallback, eventName, option]);
};

export const useDomEvent = <El extends HTMLElement>(
  target: El | null,
  eventName: keyof HTMLElementEventMap,
  callback: (e: Event) => void,
  option?: EventOption,
) => {
  useEvent<El>(target, eventName, callback, option);
};

export const useDocumentEvent = (
  eventName: keyof HTMLElementEventMap,
  callback: (e: Event) => void,
  option?: EventOption,
) => {
  if (isDocumentSafe()) {
    useEvent(document?.documentElement, eventName, callback, option);
  }
};
