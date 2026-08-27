'use server';

import type { Profile } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';

type UpdateProfileParams = {
  name: string;
  biography?: string;
  image_ids?: number[];
};

type UpdatePreferencesParams = {
  web_push: {
    liked: boolean;
    coauthor_invited: boolean;
    comment: boolean;
    published: boolean;
  };
};

type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

export async function updateProfile(
  params: UpdateProfileParams
): Promise<ActionResult<Profile>> {
  const { data, error } = await apiFetch<Profile>('/me/profile', {
    method: 'PUT',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}

export async function deleteAccount(): Promise<ActionResult> {
  const { error } = await apiFetch('/me/account', {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function updatePreferences(
  params: UpdatePreferencesParams
): Promise<ActionResult> {
  const { error } = await apiFetch('/me/preferences', {
    method: 'PUT',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
