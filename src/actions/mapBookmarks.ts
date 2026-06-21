'use server';

import { apiFetch } from '../lib/api';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function bookmarkMap(mapId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/maps/${mapId}/bookmark`, {
    method: 'POST'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function removeBookmark(mapId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/maps/${mapId}/bookmark`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
