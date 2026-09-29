'use server';

import { apiFetch } from '../lib/api.ts';
import { chapterTag } from '../lib/cacheTags.ts';
import { recordEvent } from '../lib/events.ts';
import { revalidateTags } from '../lib/revalidate.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function likeChapter(chapterId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/chapters/${chapterId}/like`, {
    method: 'POST'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([chapterTag(chapterId)]);
  recordEvent({
    name: 'like',
    params: { content_type: 'chapter', item_id: chapterId }
  });

  return { success: true };
}

export async function unlikeChapter(chapterId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/chapters/${chapterId}/like`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([chapterTag(chapterId)]);

  return { success: true };
}
