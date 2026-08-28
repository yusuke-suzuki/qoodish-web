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
      return [];
    }

    return (await res.json()) as AppMap[];
  }, []);

  const { results, isLoading } = useDebouncedSearch(input, search);

  return {
    options: results,
    isLoading
  };
}
