'use server';

import type { Commentable } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { commentableTag, commentsPath } from '../lib/commentables.ts';
import { revalidateTags } from '../lib/revalidate.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function likeComment(
  commentable: Commentable,
  commentId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `${commentsPath(commentable)}/${commentId}/like`,
    {
      method: 'POST'
    }
  );

  if (error) {
    return { success: false, error };
  }

  revalidateTags([commentableTag(commentable)]);

  return { success: true };
}

export async function unlikeComment(
  commentable: Commentable,
  commentId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `${commentsPath(commentable)}/${commentId}/like`,
    {
      method: 'DELETE'
    }
  );

  if (error) {
    return { success: false, error };
  }

  revalidateTags([commentableTag(commentable)]);

  return { success: true };
}
