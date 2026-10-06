import type { Chapter, Comment, CursorPage } from '../../types/index.ts';
import {
  apiFetch,
  apiFetchList,
  apiFetchPage,
  assertApiAvailable
} from './api.ts';
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

export function getChapterComments(
  chapterId: string | number,
  lang: string,
  token?: string
): Promise<Comment[]> {
  const guest = !token;
  return apiFetchList<Comment>(`/chapters/${chapterId}/comments`, {
    lang,
    guest,
    next: {
      revalidate: guest ? 300 : 0,
      tags: [chapterTag(chapterId), CONTENT_TAG]
    }
  });
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
  cursor?: string
): Promise<CursorPage<Chapter>> {
  return apiFetchPage<Chapter>('/v2/chapters', {
    lang,
    guest: true,
    cursor,
    next: { revalidate: cursor ? 300 : 900, tags: [CHAPTERS_TAG] }
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
