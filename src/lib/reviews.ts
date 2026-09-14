import type { Review } from '../../types/index.ts';
import { apiFetch, apiFetchList, assertApiAvailable } from './api.ts';

export async function getReview(
  reviewId: string,
  lang: string,
  token?: string,
  mapId?: string
): Promise<Review | null> {
  const guest = !token || !mapId;
  const path =
    !guest && mapId
      ? `/maps/${mapId}/reviews/${reviewId}`
      : `/reviews/${reviewId}`;
  const { data, status } = await apiFetch<Review>(path, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0 }
  });
  assertApiAvailable(status, path);
  return data;
}

export function getPopularReviews(lang: string): Promise<Review[]> {
  return apiFetchList<Review>('/reviews?popular=true', {
    lang,
    guest: true,
    next: { revalidate: 900 }
  });
}

export function getRecentReviews(lang: string): Promise<Review[]> {
  return apiFetchList<Review>('/reviews?recent=true', {
    lang,
    guest: true,
    next: { revalidate: 900 }
  });
}

export function getTimelineReviews(nextTimestamp?: string): Promise<Review[]> {
  const query = nextTimestamp
    ? `?next_timestamp=${encodeURIComponent(nextTimestamp)}`
    : '';
  return apiFetchList<Review>(`/reviews${query}`, {
    next: { revalidate: 0 }
  });
}
