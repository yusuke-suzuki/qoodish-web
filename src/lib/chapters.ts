import type { Chapter } from '../../types/index.ts';
import { apiFetch, assertApiAvailable } from './api.ts';
import { CHAPTERS_TAG, CONTENT_TAG, chapterTag, userTag } from './cacheTags.ts';

export async function getChapter(
  chapterId: string | number,
  lang: string,
  token?: string
): Promise<Chapter | null> {
  const guest = !token;
  const { data, status } = await apiFetch<Chapter>(`/chapters/${chapterId}`, {
    lang,
    guest,
    next: {
      revalidate: guest ? 300 : 0,
      tags: [chapterTag(chapterId), CONTENT_TAG]
    }
  });
  assertApiAvailable(status, `/chapters/${chapterId}`);
  return data;
}

export async function getRecentChapters(lang: string): Promise<Chapter[]> {
  const { data } = await apiFetch<Chapter[]>('/chapters', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [CHAPTERS_TAG] }
  });
  return data ?? [];
}

export async function getChapterFeed(
  lang: string,
  nextTimestamp?: string,
  nextId?: number
): Promise<Chapter[]> {
  const params = new URLSearchParams();
  if (nextTimestamp) {
    params.set('next_timestamp', nextTimestamp);
  }
  if (nextId) {
    params.set('next_id', String(nextId));
  }
  const query = params.size > 0 ? `?${params}` : '';
  const { data } = await apiFetch<Chapter[]>(`/chapters${query}`, {
    lang,
    guest: true,
    next: { revalidate: nextTimestamp ? 300 : 900, tags: [CHAPTERS_TAG] }
  });
  return data ?? [];
}

export async function getUserChapters(
  userId: string | number,
  lang: string,
  token?: string
): Promise<Chapter[]> {
  const guest = !token;
  const { data } = await apiFetch<Chapter[]>(`/users/${userId}/chapters`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0, tags: [userTag(userId), CHAPTERS_TAG] }
  });
  return data ?? [];
}

export async function getMyChapters(
  lang: string,
  token?: string
): Promise<Chapter[]> {
  if (!token) {
    return [];
  }

  const { data } = await apiFetch<Chapter[]>('/me/chapters', {
    lang,
    next: { revalidate: 0 }
  });
  return data ?? [];
}
