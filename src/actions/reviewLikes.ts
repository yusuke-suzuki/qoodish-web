'use server';

import { apiFetch } from '../lib/api';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function likeReview(reviewId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/reviews/${reviewId}/like`, {
    method: 'POST'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function unlikeReview(reviewId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/reviews/${reviewId}/like`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
