import type { AppMap, Chapter, Coauthor, Pin } from '../../types/index.ts';
import { apiFetch, apiFetchList, assertApiAvailable } from './api.ts';
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

export function getMapPins(
  mapId: string,
  lang: string,
  token?: string
): Promise<Pin[]> {
  const guest = !token;
  return apiFetchList<Pin>(`/maps/${mapId}/pins`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0, tags: [mapTag(mapId), CONTENT_TAG] }
  });
}

export function getMapCoauthors(
  mapId: string,
  lang: string,
  token?: string
): Promise<Coauthor[]> {
  const guest = !token;
  return apiFetchList<Coauthor>(`/maps/${mapId}/coauthors`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0, tags: [mapTag(mapId), CONTENT_TAG] }
  });
}

export function getMapChapters(
  mapId: string,
  lang: string,
  token?: string
): Promise<Chapter[]> {
  const guest = !token;
  return apiFetchList<Chapter>(`/maps/${mapId}/chapters`, {
    lang,
    guest,
    next: {
      revalidate: guest ? 300 : 0,
      tags: [mapTag(mapId), CHAPTERS_TAG, CONTENT_TAG]
    }
  });
}

export function getActiveMaps(lang: string): Promise<AppMap[]> {
  return apiFetchList<AppMap>('/maps?active=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [MAPS_TAG] }
  });
}

export function getPopularMaps(lang: string): Promise<AppMap[]> {
  return apiFetchList<AppMap>('/maps?popular=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [MAPS_TAG] }
  });
}

export function getRecentMaps(lang: string): Promise<AppMap[]> {
  return apiFetchList<AppMap>('/maps?recent=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [MAPS_TAG] }
  });
}

export function getRecommendMaps(
  lang: string,
  token?: string
): Promise<AppMap[]> {
  const guest = !token;
  return apiFetchList<AppMap>('/maps?recommend=true', {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0, tags: [MAPS_TAG] }
  });
}
