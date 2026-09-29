import { searchMaps } from '../utils/mapSearch.ts';
import { useDebouncedSearch } from './useDebouncedSearch.ts';

export function useMapSearch(input: string | null | undefined) {
  const { results, isLoading, failed } = useDebouncedSearch(input, searchMaps);

  return {
    options: results,
    isLoading,
    failed
  };
}
