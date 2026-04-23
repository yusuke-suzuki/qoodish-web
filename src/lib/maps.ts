import type { AppMap, Follower, Review } from '../../types';
import { apiFetch } from './api';

export async function getMap(
  mapId: string,
  lang: string,
  token?: string
): Promise<AppMap | null> {
  const guest = !token;
  const { data } = await apiFetch<AppMap>(`/maps/${mapId}`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0 }
  });
  return data;
}

export async function getMapReviews(
  mapId: string,
  lang: string,
  token?: string
): Promise<Review[]> {
  const guest = !token;
  const { data } = await apiFetch<Review[]>(`/maps/${mapId}/reviews`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0 }
  });
  return data ?? [];
}

export async function getMapFollowers(
  mapId: string,
  lang: string,
  token?: string
): Promise<Follower[]> {
  const guest = !token;
  const { data } = await apiFetch<Follower[]>(`/maps/${mapId}/collaborators`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0 }
  });
  return data ?? [];
}

export async function getActiveMaps(lang: string): Promise<AppMap[]> {
  const { data } = await apiFetch<AppMap[]>('/maps?active=true', {
    lang,
    guest: true,
    next: { revalidate: 300 }
  });
  return data ?? [];
}

export async function getPopularMaps(lang: string): Promise<AppMap[]> {
  const { data } = await apiFetch<AppMap[]>('/maps?popular=true', {
    lang,
    guest: true,
    next: { revalidate: 300 }
  });
  return data ?? [];
}

export async function getRecentMaps(lang: string): Promise<AppMap[]> {
  const { data } = await apiFetch<AppMap[]>('/maps?recent=true', {
    lang,
    guest: true,
    next: { revalidate: 300 }
  });
  return data ?? [];
}

export async function getRecommendMaps(
  lang: string,
  token?: string
): Promise<AppMap[]> {
  const guest = !token;
  const { data } = await apiFetch<AppMap[]>('/maps?recommend=true', {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0 }
  });
  return data ?? [];
}
