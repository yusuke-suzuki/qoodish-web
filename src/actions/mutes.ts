'use server';

import type { CursorPage, MutedAccount } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { userTag } from '../lib/cacheTags.ts';
import { revalidateTags } from '../lib/revalidate.ts';
import { getMutedAccounts } from '../lib/users.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function muteUser(userId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/users/${userId}/mute`, {
    method: 'POST'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([userTag(userId)]);

  return { success: true };
}

export async function unmuteUser(userId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/users/${userId}/mute`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([userTag(userId)]);

  return { success: true };
}

export async function fetchMoreMutedAccounts(
  lang: string,
  cursor: string
): Promise<CursorPage<MutedAccount>> {
  return getMutedAccounts(lang, cursor);
}
