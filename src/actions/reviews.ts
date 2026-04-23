'use server';

import type { Review } from '../../types';
import { apiFetch } from '../lib/api';
import { getTimelineReviews } from '../lib/reviews';
import { getUserReviews } from '../lib/users';

export async function fetchMoreTimelineReviews(
  nextTimestamp: string
): Promise<Review[]> {
  return getTimelineReviews(nextTimestamp);
}

export async function fetchMoreUserReviews(
  userId: number,
  nextTimestamp: string
): Promise<Review[]> {
  return getUserReviews(String(userId), undefined, nextTimestamp);
}

type CreateReviewParams = {
  name: string;
  comment: string;
  latitude: number;
  longitude: number;
  images: { url: string }[];
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

  return { success: true, data };
}

export async function updateReview(
  reviewId: number,
  params: UpdateReviewParams
): Promise<ActionResult<Review>> {
  const { data, error } = await apiFetch<Review>(`/reviews/${reviewId}`, {
    method: 'PUT',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function deleteReview(reviewId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/reviews/${reviewId}`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
