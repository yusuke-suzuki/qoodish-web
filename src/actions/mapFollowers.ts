'use server';

import { apiFetch } from '../lib/api';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function followMap(mapId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/maps/${mapId}/follow`, {
    method: 'POST'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function unfollowMap(mapId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/maps/${mapId}/follow`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
