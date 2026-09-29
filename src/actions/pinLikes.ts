'use server';

import { apiFetch } from '../lib/api.ts';
import { pinTag } from '../lib/cacheTags.ts';
import { recordEvent } from '../lib/events.ts';
import { revalidateTags } from '../lib/revalidate.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function likePin(pinId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/pins/${pinId}/like`, {
    method: 'POST'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([pinTag(pinId)]);
  recordEvent({
    name: 'like',
    params: { content_type: 'pin', item_id: pinId }
  });

  return { success: true };
}

export async function unlikePin(pinId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/pins/${pinId}/like`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([pinTag(pinId)]);

  return { success: true };
}
