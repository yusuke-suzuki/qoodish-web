'use server';

import type { AppMap } from '../../types';
import { apiFetch } from '../lib/api';

type CreateMapParams = {
  name: string;
  description: string;
  latitude: number;
  longitude: number;
  private: boolean;
  shared: boolean;
  image_url?: string;
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

  return { success: true, data };
}

export async function deleteMap(mapId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/maps/${mapId}`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
