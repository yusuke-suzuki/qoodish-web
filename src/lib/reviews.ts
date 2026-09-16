import type { Review } from '../../types/index.ts';
import { apiFetch, apiFetchList, assertApiAvailable } from './api.ts';
import { CONTENT_TAG, REVIEWS_TAG, reviewTag } from './cacheTags.ts';

export async function getReview(
  reviewId: string,
  lang: string,
  token?: string
): Promise<Review | null> {
  const guest = !token;
  const path = `/reviews/${reviewId}`;
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

export function getReviewFeed(
  lang: string,
  nextTimestamp?: string,
  nextId?: number
): Promise<Review[]> {
  const params = new URLSearchParams({ feed: 'true' });
  if (nextTimestamp) {
    params.set('next_timestamp', nextTimestamp);
  }
  if (nextId) {
    params.set('next_id', String(nextId));
  }
  return apiFetchList<Review>(`/reviews?${params}`, {
    lang,
    guest: true,
    next: { revalidate: nextTimestamp ? 300 : 900, tags: [REVIEWS_TAG] }
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
