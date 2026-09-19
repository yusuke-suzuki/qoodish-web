import type { Pin } from '../../types/index.ts';
import { apiFetch, apiFetchList, assertApiAvailable } from './api.ts';
import { CONTENT_TAG, PINS_TAG, pinTag } from './cacheTags.ts';

export async function getPin(
  pinId: string,
  lang: string,
  token?: string
): Promise<Pin | null> {
  const guest = !token;
  const path = `/pins/${pinId}`;
  const { data, status } = await apiFetch<Pin>(path, {
    lang,
    guest,
    next: {
      revalidate: guest ? 300 : 0,
      tags: [pinTag(pinId), CONTENT_TAG]
    }
  });
  assertApiAvailable(status, path);
  return data;
}

export function getPopularPins(lang: string): Promise<Pin[]> {
  return apiFetchList<Pin>('/pins?popular=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [PINS_TAG] }
  });
}

export function getRecentPins(lang: string): Promise<Pin[]> {
  return apiFetchList<Pin>('/pins?recent=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [PINS_TAG] }
  });
}

export function getPinFeed(
  lang: string,
  nextTimestamp?: string,
  nextId?: number
): Promise<Pin[]> {
  const params = new URLSearchParams({ feed: 'true' });
  if (nextTimestamp) {
    params.set('next_timestamp', nextTimestamp);
  }
  if (nextId) {
    params.set('next_id', String(nextId));
  }
  return apiFetchList<Pin>(`/pins?${params}`, {
    lang,
    guest: true,
    next: { revalidate: nextTimestamp ? 300 : 900, tags: [PINS_TAG] }
  });
}

export function getTimelinePins(nextTimestamp?: string): Promise<Pin[]> {
  const query = nextTimestamp
    ? `?next_timestamp=${encodeURIComponent(nextTimestamp)}`
    : '';
  return apiFetchList<Pin>(`/pins${query}`, {
    next: { revalidate: 0 }
  });
}
