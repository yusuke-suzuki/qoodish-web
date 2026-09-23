'use server';

import type { ContentRef } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { cacheTagFor, commentsPath } from '../lib/contentRefs.ts';
import { revalidateTags } from '../lib/revalidate.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function likeComment(
  subject: ContentRef,
  commentId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `${commentsPath(subject)}/${commentId}/like`,
    {
      method: 'POST'
    }
  );

  if (error) {
    return { success: false, error };
  }

  revalidateTags([cacheTagFor(subject)]);

  return { success: true };
}

export async function unlikeComment(
  subject: ContentRef,
  commentId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `${commentsPath(subject)}/${commentId}/like`,
    {
      method: 'DELETE'
    }
  );

  if (error) {
    return { success: false, error };
  }

  revalidateTags([cacheTagFor(subject)]);

  return { success: true };
}
