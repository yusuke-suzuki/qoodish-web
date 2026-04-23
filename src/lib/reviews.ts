import type { Review } from '../../types';
import { apiFetch } from './api';

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
  const { data } = await apiFetch<Review>(path, {
    lang,
    guest,
    next: { revalidate: guest ? 300 : 0 }
  });
  return data;
}

export async function getPopularReviews(lang: string): Promise<Review[]> {
  const { data } = await apiFetch<Review[]>('/reviews?popular=true', {
    lang,
    guest: true,
    next: { revalidate: 300 }
  });
  return data ?? [];
}

export async function getRecentReviews(lang: string): Promise<Review[]> {
  const { data } = await apiFetch<Review[]>('/reviews?recent=true', {
    lang,
    guest: true,
    next: { revalidate: 300 }
  });
  return data ?? [];
}

export async function getTimelineReviews(
  nextTimestamp?: string
): Promise<Review[]> {
  const query = nextTimestamp ? `?next_timestamp=${nextTimestamp}` : '';
  const { data } = await apiFetch<Review[]>(`/reviews${query}`, {
    next: { revalidate: 0 }
  });
  return data ?? [];
}
