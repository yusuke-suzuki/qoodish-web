import debounce from 'lodash.debounce';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { AppMap } from '../../types';

export function useMapSearch(input: string | null | undefined) {
  const [options, setOptions] = useState<AppMap[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const abortControllerRef = useRef<AbortController | null>(null);

  const fetchMaps = useMemo(
    () =>
      debounce(async (query: string) => {
        abortControllerRef.current?.abort();
        const controller = new AbortController();
        abortControllerRef.current = controller;

        setIsLoading(true);

        try {
          const res = await fetch(
            `/api/v1/guest/maps?input=${encodeURIComponent(query)}`,
            { signal: controller.signal }
          );

          if (res.ok) {
            const data: AppMap[] = await res.json();
            setOptions(data);
          }
        } catch (error) {
          if ((error as Error).name === 'AbortError') return;
          throw error;
        } finally {
          if (!controller.signal.aborted) {
            setIsLoading(false);
          }
        }
      }, 300),
    []
  );

  useEffect(() => {
    if (!input) {
      setOptions([]);
      return;
    }

    fetchMaps(input);
    return () => fetchMaps.cancel();
  }, [input, fetchMaps]);

  return {
    options,
    isLoading
  };
}
