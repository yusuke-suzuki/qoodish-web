import { useEffect, useState } from 'react';

const DEBOUNCE_MS = 300;

// One identity for every reset, so clearing an already empty list does not
// hand the consumer a new array to re-render for.
const NO_RESULTS: never[] = [];

/**
 * Runs a search over a debounced input and reports only the answer to the
 * most recent one. `search` has to keep a stable identity — wrap it in
 * `useCallback` or `useMemo` — or the debounce restarts on every render.
 */
export function useDebouncedSearch<R>(
  input: string | null | undefined,
  search: (query: string, signal: AbortSignal) => Promise<R[]>
) {
  const [results, setResults] = useState<R[]>(NO_RESULTS);
  const [isLoading, setIsLoading] = useState(false);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    if (!input) {
      setResults(NO_RESULTS);
      setIsLoading(false);
      setFailed(false);

      return;
    }

    setIsLoading(true);

    let current = true;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const next = await search(input, controller.signal);

        if (current) {
          setResults(next);
          setFailed(false);
        }
      } catch {
        if (current) {
          setResults(NO_RESULTS);
          setFailed(true);
        }
      } finally {
        if (current) {
          setIsLoading(false);
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      current = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [input, search]);

  return { results, isLoading, failed };
}
