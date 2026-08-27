'use client';

import { useCallback, useLayoutEffect, useRef } from 'react';

/**
 * Wraps a callback so listeners and timers that outlive the render which
 * registered them still reach the newest committed closure, without the
 * registration having to be torn down whenever that closure changes.
 *
 * React 19.2 ships useEffectEvent for exactly this, but Next.js serves the
 * client its own bundled copy of React, and that copy does not export it — the
 * installed react does, so the type check and the build both pass and only the
 * browser throws.
 */
export default function useLatestCallback<A extends unknown[], R>(
  callback: (...args: A) => R
): (...args: A) => R {
  const latest = useRef(callback);

  // Published in the commit phase, so a fix or an event arriving before the
  // passive effects run is still handled by the closure that belongs to the
  // rendered state.
  useLayoutEffect(() => {
    latest.current = callback;
  });

  return useCallback((...args: A) => latest.current(...args), []);
}
