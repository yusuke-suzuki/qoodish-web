import type { Chapter } from '../../types';
import { apiFetch, assertApiAvailable } from './api';

export async function getChapter(
  chapterId: string | number,
  lang: string,
  token?: string
): Promise<Chapter | null> {
  const guest = !token;
  const { data, status } = await apiFetch<Chapter>(`/chapters/${chapterId}`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0 }
  });
  assertApiAvailable(status, `/chapters/${chapterId}`);
  return data;
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
    next: { revalidate: guest ? 300 : 0 }
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
