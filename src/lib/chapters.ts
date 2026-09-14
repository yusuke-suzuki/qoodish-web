import type { Chapter } from '../../types/index.ts';
import { apiFetch, apiFetchList, assertApiAvailable } from './api.ts';
import { CHAPTERS_TAG, chapterTag, userTag } from './cacheTags.ts';

export async function getChapter(
  chapterId: string | number,
  lang: string,
  token?: string
): Promise<Chapter | null> {
  const guest = !token;
  const { data, status } = await apiFetch<Chapter>(`/chapters/${chapterId}`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0, tags: [chapterTag(chapterId)] }
  });
  assertApiAvailable(status, `/chapters/${chapterId}`);
  return data;
}

export function getRecentChapters(lang: string): Promise<Chapter[]> {
  return apiFetchList<Chapter>('/chapters', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [CHAPTERS_TAG] }
  });
}

export function getChapterFeed(
  lang: string,
  nextTimestamp?: string,
  nextId?: number
): Promise<Chapter[]> {
  const query = nextTimestamp
    ? `?next_timestamp=${encodeURIComponent(nextTimestamp)}${nextId ? `&next_id=${nextId}` : ''}`
    : '';
  return apiFetchList<Chapter>(`/chapters${query}`, {
    lang,
    guest: true,
    next: { revalidate: nextTimestamp ? 300 : 900, tags: [CHAPTERS_TAG] }
  });
}

export function getUserChapters(
  userId: string | number,
  lang: string,
  token?: string
): Promise<Chapter[]> {
  const guest = !token;
  return apiFetchList<Chapter>(`/users/${userId}/chapters`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0, tags: [userTag(userId), CHAPTERS_TAG] }
  });
}

export function getMyChapters(
  lang: string,
  token?: string
): Promise<Chapter[]> {
  if (!token) {
    return Promise.resolve([]);
  }

  return apiFetchList<Chapter>('/me/chapters', {
    lang,
    next: { revalidate: 0 }
  });
}
