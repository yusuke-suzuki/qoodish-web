import debounce from 'lodash.debounce';
import { useEffect, useMemo, useState } from 'react';

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

  const run = useMemo(
    () =>
      debounce(
        async (
          query: string,
          isCurrent: () => boolean,
          signal: AbortSignal
        ) => {
          try {
            const next = await search(query, signal);

            if (isCurrent()) {
              setResults(next);
            }
          } catch {
            if (isCurrent()) {
              setResults(NO_RESULTS);
            }
          } finally {
            if (isCurrent()) {
              setIsLoading(false);
            }
          }
        },
        DEBOUNCE_MS
      ),
    [search]
  );

  useEffect(() => {
    // A request already in flight can resolve during the debounce wait of the
    // one replacing it, so what counts as current is settled when the input
    // changes rather than after the wait.
    let current = true;
    const isCurrent = () => current;

    const abandon = () => {
      current = false;
      run.cancel();
    };

    if (!input) {
      run.cancel();

      setResults(NO_RESULTS);
      setIsLoading(false);

      return abandon;
    }

    // The debounce wait is part of the request. Raising this inside the
    // debounced body instead leaves a window with no results and no loading
    // flag, which is what an Autocomplete renders "not found" for.
    setIsLoading(true);

    const controller = new AbortController();

    run(input, isCurrent, controller.signal);

    return () => {
      abandon();
      controller.abort();
    };
  }, [input, run]);

  return { results, isLoading };
}
