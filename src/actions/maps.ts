'use server';

import type { AppMap } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { MAPS_TAG, mapTag, userTag } from '../lib/cacheTags.ts';
import { revalidateTags } from '../lib/revalidate.ts';

type CreateMapParams = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  private: boolean;
  image_ids?: number[];
};

type UpdateMapParams = CreateMapParams;

type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createMap(
  params: CreateMapParams
): Promise<ActionResult<AppMap>> {
  const { data, error } = await apiFetch<AppMap>('/maps', {
    method: 'POST',
    body: JSON.stringify({ ...params, invitable: false })
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([MAPS_TAG, data && userTag(data.author.id)]);

  return { success: true, data };
}

export async function updateMap(
  mapId: number,
  params: UpdateMapParams
): Promise<ActionResult<AppMap>> {
  const { data, error } = await apiFetch<AppMap>(`/maps/${mapId}`, {
    method: 'PUT',
    body: JSON.stringify({ ...params, invitable: false })
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([mapTag(mapId), MAPS_TAG, data && userTag(data.author.id)]);

  return { success: true, data };
}

export async function deleteMap(
  mapId: number,
  authorId?: number
): Promise<ActionResult> {
  const { error } = await apiFetch(`/maps/${mapId}`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([mapTag(mapId), MAPS_TAG, authorId && userTag(authorId)]);

  return { success: true };
}
