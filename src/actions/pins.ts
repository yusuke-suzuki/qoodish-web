'use server';

import type { Pin } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { mapTag, PINS_TAG, pinTag, userTag } from '../lib/cacheTags.ts';
import { getPinFeed, getTimelinePins } from '../lib/pins.ts';
import { revalidateTags } from '../lib/revalidate.ts';
import { getMyPins, getUserPins } from '../lib/users.ts';

export async function fetchMoreTimelinePins(
  nextTimestamp: string
): Promise<Pin[]> {
  return getTimelinePins(nextTimestamp);
}

export async function fetchMorePinFeed(
  lang: string,
  nextTimestamp: string,
  nextId: number
): Promise<Pin[]> {
  return getPinFeed(lang, nextTimestamp, nextId);
}

export async function fetchMoreUserPins(
  userId: number,
  nextTimestamp: string
): Promise<Pin[]> {
  return getUserPins(String(userId), undefined, nextTimestamp);
}

export async function fetchMoreMyPins(nextTimestamp: string): Promise<Pin[]> {
  return getMyPins(undefined, nextTimestamp);
}

type CreatePinParams = {
  name: string;
  comment: string;
  latitude: number;
  longitude: number;
  image_ids: number[];
};

type UpdatePinParams = CreatePinParams;

type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function createPin(
  mapId: number,
  params: CreatePinParams
): Promise<ActionResult<Pin>> {
  const { data, error } = await apiFetch<Pin>(`/maps/${mapId}/pins`, {
    method: 'POST',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([mapTag(mapId), PINS_TAG, data && userTag(data.author.id)]);

  return { success: true, data };
}

export async function updatePin(
  pinId: number,
  params: UpdatePinParams
): Promise<ActionResult<Pin>> {
  const { data, error } = await apiFetch<Pin>(`/me/pins/${pinId}`, {
    method: 'PUT',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([
    pinTag(pinId),
    PINS_TAG,
    data && mapTag(data.map.id),
    data && userTag(data.author.id)
  ]);

  return { success: true, data };
}

export async function deletePin(
  pinId: number,
  mapId?: number,
  authorId?: number
): Promise<ActionResult> {
  const { error } = await apiFetch(`/me/pins/${pinId}`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([
    pinTag(pinId),
    PINS_TAG,
    mapId && mapTag(mapId),
    authorId && userTag(authorId)
  ]);

  return { success: true };
}
