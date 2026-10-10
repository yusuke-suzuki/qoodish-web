import type {
  GuestChapter,
  GuestMap,
  GuestPin,
  SearchResult,
  UserSummary
} from '../../types/index.ts';

const MIN_TERM_LENGTH = 2;

export function hasSearchableTerm(input: string): boolean {
  return input
    .split(/\s+/)
    .some(
      (term) => Array.from(term.replaceAll('"', '')).length >= MIN_TERM_LENGTH
    );
}

export const SEARCH_RESULT_GROUPS = [
  { type: 'map', label: 'maps' },
  { type: 'chapter', label: 'chapters' },
  { type: 'pin', label: 'pins' },
  { type: 'user', label: 'users' }
] as const;

type SearchHits = {
  maps: GuestMap[];
  chapters: GuestChapter[];
  pins: GuestPin[];
  users: UserSummary[];
};

export function toSearchResults(
  { maps, chapters, pins, users }: SearchHits,
  localePath: (path: string) => string
): SearchResult[] {
  return [
    ...maps.map((map) => ({
      type: 'map' as const,
      id: map.id,
      name: map.name,
      detail: null,
      avatar: map.image?.avatar,
      href: localePath(`/maps/${map.id}`)
    })),
    ...chapters.map((chapter) => ({
      type: 'chapter' as const,
      id: chapter.id,
      name: chapter.title,
      detail: chapter.map.name,
      avatar: chapter.image?.avatar,
      href: localePath(`/chapters/${chapter.id}`)
    })),
    ...pins.map((pin) => ({
      type: 'pin' as const,
      id: pin.id,
      name: pin.name,
      detail: pin.map.name,
      avatar: pin.images[0]?.avatar,
      href: localePath(`/pins/${pin.id}`)
    })),
    ...users.map((user) => ({
      type: 'user' as const,
      id: user.id,
      name: user.name,
      detail: null,
      avatar: user.image?.avatar,
      href: localePath(`/users/${user.id}`)
    }))
  ];
}

async function fetchSearch<T>(path: string, signal: AbortSignal): Promise<T[]> {
  const res = await fetch(`/api/v1/${path}`, { signal });

  if (!res.ok) {
    throw new Error(`Search for ${path} failed with status ${res.status}`);
  }

  return (await res.json()) as T[];
}

export function searchMaps(query: string, signal: AbortSignal) {
  return fetchSearch<GuestMap>(
    `guest/maps?input=${encodeURIComponent(query)}`,
    signal
  );
}

export function searchChapters(query: string, signal: AbortSignal) {
  return fetchSearch<GuestChapter>(
    `guest/chapters?input=${encodeURIComponent(query)}`,
    signal
  );
}

export function searchPins(query: string, signal: AbortSignal) {
  return fetchSearch<GuestPin>(
    `guest/pins?input=${encodeURIComponent(query)}`,
    signal
  );
}

export function searchUsers(query: string, signal: AbortSignal) {
  return fetchSearch<UserSummary>(
    `users?q=${encodeURIComponent(query)}`,
    signal
  );
}
