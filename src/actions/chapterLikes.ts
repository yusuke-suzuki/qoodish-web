'use server';

import { apiFetch } from '../lib/api.ts';

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

  return { success: true };
}

export async function unlikeChapter(chapterId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/chapters/${chapterId}/like`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
