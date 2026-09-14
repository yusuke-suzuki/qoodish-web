import type { Review } from '../../types/index.ts';
import { apiFetch, apiFetchList, assertApiAvailable } from './api.ts';
import { CONTENT_TAG, REVIEWS_TAG, reviewTag } from './cacheTags.ts';

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
    next: {
      revalidate: guest ? 300 : 0,
      tags: [reviewTag(reviewId), CONTENT_TAG]
    }
  });
  assertApiAvailable(status, path);
  return data;
}

export function getPopularReviews(lang: string): Promise<Review[]> {
  return apiFetchList<Review>('/reviews?popular=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [REVIEWS_TAG] }
  });
}

export function getRecentReviews(lang: string): Promise<Review[]> {
  return apiFetchList<Review>('/reviews?recent=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [REVIEWS_TAG] }
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
