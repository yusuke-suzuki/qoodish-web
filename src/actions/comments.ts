'use server';

import type { ContentRef } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { cacheTagFor, commentsPath } from '../lib/contentRefs.ts';
import { revalidateTags } from '../lib/revalidate.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createComment(
  subject: ContentRef,
  comment: string
): Promise<ActionResult> {
  const { error } = await apiFetch(commentsPath(subject), {
    method: 'POST',
    body: JSON.stringify({ comment })
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([cacheTagFor(subject)]);

  return { success: true };
}

export async function deleteComment(
  subject: ContentRef,
  commentId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(`${commentsPath(subject)}/${commentId}`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([cacheTagFor(subject)]);

  return { success: true };
}
