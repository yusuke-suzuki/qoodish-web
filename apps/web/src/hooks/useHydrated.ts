import { useSyncExternalStore } from 'react';

const subscribe = () => () => {};

export default function useHydrated() {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false
  );
}
