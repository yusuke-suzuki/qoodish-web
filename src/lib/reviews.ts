import type { Review } from '../../types/index.ts';
import { apiFetch, assertApiAvailable } from './api.ts';
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

export async function getPopularReviews(lang: string): Promise<Review[]> {
  const { data } = await apiFetch<Review[]>('/reviews?popular=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [REVIEWS_TAG] }
  });
  return data ?? [];
}

export async function getRecentReviews(lang: string): Promise<Review[]> {
  const { data } = await apiFetch<Review[]>('/reviews?recent=true', {
    lang,
    guest: true,
    next: { revalidate: 900, tags: [REVIEWS_TAG] }
  });
  return data ?? [];
}

export async function getTimelineReviews(
  nextTimestamp?: string
): Promise<Review[]> {
  const query = nextTimestamp
    ? `?next_timestamp=${encodeURIComponent(nextTimestamp)}`
    : '';
  const { data } = await apiFetch<Review[]>(`/reviews${query}`, {
    next: { revalidate: 0 }
  });
  return data ?? [];
}
