'use server';

import type { Review } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { mapTag, REVIEWS_TAG, reviewTag, userTag } from '../lib/cacheTags.ts';
import { revalidateTags } from '../lib/revalidate.ts';
import { getReviewFeed, getTimelineReviews } from '../lib/reviews.ts';
import { getMyReviews, getUserReviews } from '../lib/users.ts';

export async function fetchMoreTimelineReviews(
  nextTimestamp: string
): Promise<Review[]> {
  return getTimelineReviews(nextTimestamp);
}

export async function fetchMoreReviewFeed(
  lang: string,
  nextTimestamp: string
): Promise<Review[]> {
  return getReviewFeed(lang, nextTimestamp);
}

export async function fetchMoreUserReviews(
  userId: number,
  nextTimestamp: string
): Promise<Review[]> {
  return getUserReviews(String(userId), undefined, nextTimestamp);
}

export async function fetchMoreMyReviews(
  nextTimestamp: string
): Promise<Review[]> {
  return getMyReviews(undefined, nextTimestamp);
}

type CreateReviewParams = {
  name: string;
  comment: string;
  latitude: number;
  longitude: number;
  image_ids: number[];
};

type UpdateReviewParams = CreateReviewParams;

type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createReview(
  mapId: number,
  params: CreateReviewParams
): Promise<ActionResult<Review>> {
  const { data, error } = await apiFetch<Review>(`/maps/${mapId}/reviews`, {
    method: 'POST',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([mapTag(mapId), REVIEWS_TAG, data && userTag(data.author.id)]);

  return { success: true, data };
}

export async function updateReview(
  reviewId: number,
  params: UpdateReviewParams
): Promise<ActionResult<Review>> {
  const { data, error } = await apiFetch<Review>(`/me/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([
    reviewTag(reviewId),
    REVIEWS_TAG,
    data && mapTag(data.map.id),
    data && userTag(data.author.id)
  ]);

  return { success: true, data };
}

export async function deleteReview(
  reviewId: number,
  mapId?: number,
  authorId?: number
): Promise<ActionResult> {
  const { error } = await apiFetch(`/me/reviews/${reviewId}`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([
    reviewTag(reviewId),
    REVIEWS_TAG,
    mapId && mapTag(mapId),
    authorId && userTag(authorId)
  ]);

  return { success: true };
}
