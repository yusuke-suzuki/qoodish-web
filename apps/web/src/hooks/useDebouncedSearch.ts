import { useEffect, useState } from 'react';

const DEBOUNCE_MS = 300;

// One identity for every reset, so clearing an already empty list does not
// hand the consumer a new array to re-render for.
const NO_RESULTS: never[] = [];

type Answer<R> = {
  input: string;
  results: R[];
  failed: boolean;
};

/**
 * Runs a search over a debounced input and reports only the answer to the
 * most recent one. `search` has to keep a stable identity — wrap it in
 * `useCallback` or `useMemo` — or the debounce restarts on every render.
 */
export function useDebouncedSearch<R>(
  input: string | null | undefined,
  search: (query: string, signal: AbortSignal) => Promise<R[]>
) {
  const [answer, setAnswer] = useState<Answer<R> | null>(null);

  useEffect(() => {
    if (!input) {
      return;
    }

    let current = true;
    const controller = new AbortController();

    const timer = setTimeout(async () => {
      try {
        const next = await search(input, controller.signal);

        if (current) {
          setAnswer({ input, results: next, failed: false });
        }
      } catch {
        if (current) {
          setAnswer({ input, results: NO_RESULTS, failed: true });
        }
      }
    }, DEBOUNCE_MS);

    return () => {
      current = false;
      clearTimeout(timer);
      controller.abort();
    };
  }, [input, search]);

  if (!input) {
    if (answer) {
      setAnswer(null);
    }

    return { results: NO_RESULTS, isLoading: false, failed: false };
  }

  const answered = answer?.input === input;

  return {
    results: answer?.results ?? NO_RESULTS,
    isLoading: !answered,
    failed: answered && answer.failed
  };
}
