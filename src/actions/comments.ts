'use server';

import type { Commentable } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { commentableTag, commentsPath } from '../lib/commentables.ts';
import { revalidateTags } from '../lib/revalidate.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createComment(
  commentable: Commentable,
  comment: string
): Promise<ActionResult> {
  const { error } = await apiFetch(commentsPath(commentable), {
    method: 'POST',
    body: JSON.stringify({ comment })
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([commentableTag(commentable)]);

  return { success: true };
}

export async function deleteComment(
  commentable: Commentable,
  commentId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `${commentsPath(commentable)}/${commentId}`,
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
