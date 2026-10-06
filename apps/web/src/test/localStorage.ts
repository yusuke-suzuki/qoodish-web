export type StorageStub = Pick<Storage, 'getItem' | 'setItem' | 'removeItem'>;

export function installLocalStorage(stub: StorageStub): void {
  (globalThis as unknown as { window: { localStorage: StorageStub } }).window =
    {
      localStorage: stub
    };
}

export function memoryStorage(): StorageStub & { store: Map<string, string> } {
  const store = new Map<string, string>();

  return {
    store,
    getItem: (key) => store.get(key) ?? null,
    setItem: (key, value) => {
      store.set(key, value);
    },
    removeItem: (key) => {
      store.delete(key);
    }
  };
}

export function throwingStorage(): StorageStub {
  const denied = () => {
    throw new Error('denied');
  };

  return { getItem: denied, setItem: denied, removeItem: denied };
}
