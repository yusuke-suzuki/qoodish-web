'use server';

import type { Profile } from '../../types';
import { apiFetch } from '../lib/api';

type UpdateProfileParams = {
  name: string;
  biography?: string;
  image_path?: string;
};

type UpdatePushNotificationParams = {
  liked: boolean;
  followed: boolean;
  comment: boolean;
};

type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function updateProfile(
  userId: number,
  params: UpdateProfileParams
): Promise<ActionResult<Profile>> {
  const { data, error } = await apiFetch<Profile>(`/users/${userId}`, {
    method: 'PUT',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function deleteAccount(uid: string): Promise<ActionResult> {
  const { error } = await apiFetch(`/users/${uid}`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function updatePushNotification(
  uid: string,
  params: UpdatePushNotificationParams
): Promise<ActionResult> {
  const { error } = await apiFetch(`/users/${uid}/push_notification`, {
    method: 'PUT',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
