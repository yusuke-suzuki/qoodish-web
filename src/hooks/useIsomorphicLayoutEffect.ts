import { useEffect, useLayoutEffect } from 'react';

// Layout effects run in the commit phase, so a value published from one is in
// place before anything the browser schedules afterwards can read it — which a
// passive effect cannot promise. There is no commit phase on the server, where
// useLayoutEffect only warns, so the server falls back to useEffect.
const useIsomorphicLayoutEffect =
  typeof window === 'undefined' ? useEffect : useLayoutEffect;

export default useIsomorphicLayoutEffect;
