import { useCallback } from 'react';
import type { AppMap } from '../../types/index.ts';
import { useDebouncedSearch } from './useDebouncedSearch.ts';

export function useMapSearch(input: string | null | undefined) {
  const search = useCallback(async (query: string, signal: AbortSignal) => {
    const res = await fetch(
      `/api/v1/guest/maps?input=${encodeURIComponent(query)}`,
      { signal }
    );

    if (!res.ok) {
      throw new Error(`Map search failed with status ${res.status}`);
    }

    return (await res.json()) as AppMap[];
  }, []);

  const { results, isLoading, failed } = useDebouncedSearch(input, search);

  return {
    options: results,
    isLoading,
    failed
  };
}
