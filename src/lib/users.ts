import type {
  AppMap,
  BlockedAccount,
  CursorPage,
  Journal,
  MutedAccount,
  Notification,
  Pin,
  Profile
} from '../../types/index.ts';
import {
  apiFetch,
  apiFetchList,
  apiFetchPage,
  assertApiAvailable
} from './api.ts';
import { MAPS_TAG, userTag } from './cacheTags.ts';

export async function getProfile(
  userId: string,
  lang: string,
  token?: string
): Promise<Profile | null> {
  const guest = !token;
  const { data, status } = await apiFetch<Profile>(`/users/${userId}`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0, tags: [userTag(userId)] }
  });
  assertApiAvailable(status, `/users/${userId}`);
  return data;
}

export async function getMyProfile(
  lang: string,
  token?: string
): Promise<Profile | null> {
  if (!token) {
    return null;
  }

  const { data } = await apiFetch<Profile>('/me/profile', {
    lang,
    next: { revalidate: 0 }
  });
  return data;
}

export function getUserMaps(
  userId: string,
  lang: string,
  token?: string
): Promise<AppMap[]> {
  const guest = !token;
  return apiFetchList<AppMap>(`/users/${userId}/maps`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0, tags: [userTag(userId), MAPS_TAG] }
  });
}

export function getMyMaps(lang: string, token?: string): Promise<AppMap[]> {
  if (!token) {
    return Promise.resolve([]);
  }

  return apiFetchList<AppMap>('/me/maps', {
    lang,
    next: { revalidate: 0 }
  });
}

export async function getUserJournal(
  userId: string,
  lang: string,
  token?: string
): Promise<Journal | null> {
  if (!token) {
    return null;
  }

  const path = `/users/${userId}/journal`;
  const { data, status } = await apiFetch<Journal>(path, {
    lang,
    next: { revalidate: 0 }
  });
  assertApiAvailable(status, path);
  return data;
}

export async function getMyJournal(
  lang: string,
  token?: string
): Promise<Journal | null> {
  if (!token) {
    return null;
  }

  const { data, status } = await apiFetch<Journal>('/me/journal', {
    lang,
    next: { revalidate: 0 }
  });
  assertApiAvailable(status, '/me/journal');
  return data;
}

export function getBookmarkedMaps(
  lang: string,
  token?: string
): Promise<AppMap[]> {
  if (!token) {
    return Promise.resolve([]);
  }

  return apiFetchList<AppMap>('/me/bookmarks/maps', {
    lang,
    next: { revalidate: 0 }
  });
}

export function getBookmarkedJournals(
  lang: string,
  token?: string
): Promise<Journal[]> {
  if (!token) {
    return Promise.resolve([]);
  }

  return apiFetchList<Journal>('/me/bookmarks/journals', {
    lang,
    next: { revalidate: 0 }
  });
}

export function getUserPins(
  userId: string,
  lang?: string,
  cursor?: string
): Promise<CursorPage<Pin>> {
  return apiFetchPage<Pin>(`/v2/users/${userId}/pins`, {
    lang,
    cursor,
    next: { revalidate: 0 }
  });
}

export function getMyPins(
  lang?: string,
  cursor?: string
): Promise<CursorPage<Pin>> {
  return apiFetchPage<Pin>('/v2/me/pins', {
    lang,
    cursor,
    next: { revalidate: 0 }
  });
}

export function getBlockedAccounts(
  lang?: string,
  cursor?: string
): Promise<CursorPage<BlockedAccount>> {
  return apiFetchPage<BlockedAccount>('/v2/me/blocks', {
    lang,
    cursor,
    next: { revalidate: 0 }
  });
}

export function getMutedAccounts(
  lang?: string,
  cursor?: string
): Promise<CursorPage<MutedAccount>> {
  return apiFetchPage<MutedAccount>('/v2/me/mutes', {
    lang,
    cursor,
    next: { revalidate: 0 }
  });
}

export function getNotifications(
  lang: string,
  { cursor, read }: { cursor?: string; read?: boolean } = {}
): Promise<CursorPage<Notification>> {
  return apiFetchPage<Notification>('/v2/me/notifications', {
    lang,
    cursor,
    query: read === undefined ? undefined : { read: String(read) },
    next: { revalidate: 0 }
  });
}
