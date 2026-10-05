'use server';

import type { BlockedAccount, CursorPage } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { userTag } from '../lib/cacheTags.ts';
import { revalidateTags } from '../lib/revalidate.ts';
import { getBlockedAccounts } from '../lib/users.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function blockUser(userId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/users/${userId}/block`, {
    method: 'POST'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([userTag(userId)]);

  return { success: true };
}

export async function unblockUser(userId: number): Promise<ActionResult> {
  const { error } = await apiFetch(`/users/${userId}/block`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  revalidateTags([userTag(userId)]);

  return { success: true };
}

export async function fetchMoreBlockedAccounts(
  lang: string,
  cursor: string
): Promise<CursorPage<BlockedAccount>> {
  return getBlockedAccounts(lang, cursor);
}
