import type { AppMap, Chapter, Coauthor, Review } from '../../types/index.ts';
import { apiFetch, apiFetchList, assertApiAvailable } from './api.ts';

export async function getMap(
  mapId: string,
  lang: string,
  token?: string
): Promise<AppMap | null> {
  const guest = !token;
  const { data, status } = await apiFetch<AppMap>(`/maps/${mapId}`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0 }
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
    next: { revalidate: 900 }
  });
  assertApiAvailable(status, '/maps/featured');
  return data;
}

export function getMapReviews(
  mapId: string,
  lang: string,
  token?: string
): Promise<Review[]> {
  const guest = !token;
  return apiFetchList<Review>(`/maps/${mapId}/reviews`, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0 }
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
    next: { revalidate: guest ? 300 : 0 }
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
    next: { revalidate: guest ? 300 : 0 }
  });
}

export function getActiveMaps(lang: string): Promise<AppMap[]> {
  return apiFetchList<AppMap>('/maps?active=true', {
    lang,
    guest: true,
    next: { revalidate: 900 }
  });
}

export function getPopularMaps(lang: string): Promise<AppMap[]> {
  return apiFetchList<AppMap>('/maps?popular=true', {
    lang,
    guest: true,
    next: { revalidate: 900 }
  });
}

export function getRecentMaps(lang: string): Promise<AppMap[]> {
  return apiFetchList<AppMap>('/maps?recent=true', {
    lang,
    guest: true,
    next: { revalidate: 900 }
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
    next: { revalidate: guest ? 300 : 0 }
  });
}
