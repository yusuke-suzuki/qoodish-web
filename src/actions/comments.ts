'use server';

import { apiFetch } from '../lib/api';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createComment(
  reviewId: number,
  comment: string
): Promise<ActionResult> {
  const { error } = await apiFetch(`/reviews/${reviewId}/comments`, {
    method: 'POST',
    body: JSON.stringify({ comment })
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function deleteComment(
  reviewId: number,
  commentId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `/reviews/${reviewId}/comments/${commentId}`,
    {
      method: 'DELETE'
    }
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
