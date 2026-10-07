import type { CursorPage, Pin } from '../../types/index.ts';
import {
  apiFetch,
  apiFetchList,
  apiFetchPage,
  assertApiAvailable
} from './api.ts';
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
  cursor?: string
): Promise<CursorPage<Pin>> {
  return apiFetchPage<Pin>('/v2/pins', {
    lang,
    guest: true,
    cursor,
    next: { revalidate: cursor ? 300 : 900, tags: [PINS_TAG] }
  });
}

export function getTimelinePins(cursor?: string): Promise<CursorPage<Pin>> {
  return apiFetchPage<Pin>('/v2/pins', {
    cursor,
    next: { revalidate: 0 }
  });
}
