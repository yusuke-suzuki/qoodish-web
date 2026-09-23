'use server';

import { apiFetch } from '../lib/api.ts';
import { pinTag } from '../lib/cacheTags.ts';
import { revalidateTags } from '../lib/revalidate.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function likeComment(
  pinId: number,
  commentId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `/pins/${pinId}/comments/${commentId}/like`,
    {
      method: 'POST'
    }
  );

  if (error) {
    return { success: false, error };
  }

  revalidateTags([pinTag(pinId)]);

  return { success: true };
}

export async function unlikeComment(
  pinId: number,
  commentId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `/pins/${pinId}/comments/${commentId}/like`,
    {
      method: 'DELETE'
    }
  );

  if (error) {
    return { success: false, error };
  }

  revalidateTags([pinTag(pinId)]);

  return { success: true };
}
