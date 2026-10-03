import { useContext } from 'react';
import AuthContext from '../context/AuthContext.ts';
import {
  hasSearchableTerm,
  searchChapters,
  searchMaps,
  searchPins,
  searchUsers,
  toSearchResults
} from '../utils/search.ts';
import { useDebouncedSearch } from './useDebouncedSearch.ts';
import useLocalePath from './useLocalePath.ts';

export function useSiteSearch(input: string | null | undefined) {
  const { authenticated } = useContext(AuthContext);
  const localePath = useLocalePath();

  const trimmed = input?.trim() ?? '';
  const query = hasSearchableTerm(trimmed) ? trimmed : null;

  const maps = useDebouncedSearch(query, searchMaps);
  const chapters = useDebouncedSearch(query, searchChapters);
  const pins = useDebouncedSearch(query, searchPins);
  const users = useDebouncedSearch(authenticated ? query : null, searchUsers);

  const searches = [maps, chapters, pins, users];

  return {
    results: toSearchResults(
      {
        maps: maps.results,
        chapters: chapters.results,
        pins: pins.results,
        users: users.results
      },
      localePath
    ),
    includesUsers: authenticated,
    active: query !== null,
    isLoading: searches.some((search) => search.isLoading),
    failed: searches.some((search) => search.failed)
  };
}
