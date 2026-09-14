import type { AppMap, Chapter, Coauthor, Review } from '../../types/index.ts';
import { apiFetch, assertApiAvailable } from './api.ts';
import { CHAPTERS_TAG, CONTENT_TAG, MAPS_TAG, mapTag } from './cacheTags.ts';

export async function getMap(
  mapId: string,
  lang: string,
  token?: string
): Promise<AppMap | null> {
  const guest = !token;
  const { data, status } = await apiFetch<AppMap>(`/maps/${mapId}`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0, tags: [mapTag(mapId), CONTENT_TAG] }
  });
  assertApiAvailable(status, `/maps/${mapId}`);
  return data;
}

export async function getFeaturedMap(lang: string): Promise<AppMap | null> {
  // A 404 here means nothing is featured, which the discover page renders as an
  // empty slot — only an unreachable API should surface as an error.
  const { data, status } = await apiFetch<AppMap>('/maps/featured', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [MAPS_TAG] }
  });
  assertApiAvailable(status, '/maps/featured');
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
    next: { revalidate: guest ? 300 : 0, tags: [mapTag(mapId), CONTENT_TAG] }
  });
  return data ?? [];
}

export async function getMapCoauthors(
  mapId: string,
  lang: string,
  token?: string
): Promise<Coauthor[]> {
  const guest = !token;
  const { data } = await apiFetch<Coauthor[]>(`/maps/${mapId}/coauthors`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0, tags: [mapTag(mapId), CONTENT_TAG] }
  });
  return data ?? [];
}

export async function getMapChapters(
  mapId: string,
  lang: string,
  token?: string
): Promise<Chapter[]> {
  const guest = !token;
  const { data } = await apiFetch<Chapter[]>(`/maps/${mapId}/chapters`, {
    lang,
    guest,
    next: {
      revalidate: guest ? 300 : 0,
      tags: [mapTag(mapId), CHAPTERS_TAG, CONTENT_TAG]
    }
  });
  return data ?? [];
}

export async function getActiveMaps(lang: string): Promise<AppMap[]> {
  const { data } = await apiFetch<AppMap[]>('/maps?active=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [MAPS_TAG] }
  });
  return data ?? [];
}

export async function getPopularMaps(lang: string): Promise<AppMap[]> {
  const { data } = await apiFetch<AppMap[]>('/maps?popular=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [MAPS_TAG] }
  });
  return data ?? [];
}

export async function getRecentMaps(lang: string): Promise<AppMap[]> {
  const { data } = await apiFetch<AppMap[]>('/maps?recent=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [MAPS_TAG] }
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
    next: { revalidate: guest ? 300 : 0, tags: [MAPS_TAG] }
  });
  return data ?? [];
}
