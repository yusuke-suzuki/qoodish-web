import type {
  AppMap,
  Journal,
  Notification,
  Profile,
  Review
} from '../../types';
import { apiFetch } from './api';

export async function getProfile(
  userId: string,
  lang: string,
  token?: string
): Promise<Profile | null> {
  const guest = !token;
  const { data } = await apiFetch<Profile>(`/users/${userId}`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0 }
  });
  return data;
}

export async function getUserMaps(
  userId: string,
  lang: string,
  token?: string
): Promise<AppMap[]> {
  const guest = !token;
  const { data } = await apiFetch<AppMap[]>(`/users/${userId}/maps`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0 }
  });
  return data ?? [];
}

export async function getUserJournal(
  userId: string,
  lang: string,
  token?: string
): Promise<Journal | null> {
  if (!token) {
    return null;
  }

  const { data } = await apiFetch<Journal>(`/users/${userId}/journal`, {
    lang,
    next: { revalidate: 0 }
  });
  return data;
}

export async function getBookmarkedMaps(
  lang: string,
  token?: string
): Promise<AppMap[]> {
  if (!token) {
    return [];
  }

  const { data } = await apiFetch<AppMap[]>('/me/bookmarks/maps', {
    lang,
    next: { revalidate: 0 }
  });
  return data ?? [];
}

export async function getBookmarkedJournals(
  lang: string,
  token?: string
): Promise<Journal[]> {
  if (!token) {
    return [];
  }

  const { data } = await apiFetch<Journal[]>('/me/bookmarks/journals', {
    lang,
    next: { revalidate: 0 }
  });
  return data ?? [];
}

export async function getUserReviews(
  userId: string,
  lang?: string,
  nextTimestamp?: string
): Promise<Review[]> {
  const query = nextTimestamp ? `?next_timestamp=${nextTimestamp}` : '';
  const { data } = await apiFetch<Review[]>(
    `/users/${userId}/reviews${query}`,
    {
      lang,
      next: { revalidate: 0 }
    }
  );
  return data ?? [];
}

export async function getNotifications(lang: string): Promise<Notification[]> {
  const { data } = await apiFetch<Notification[]>('/notifications', {
    lang,
    next: { revalidate: 0 }
  });
  return data ?? [];
}
