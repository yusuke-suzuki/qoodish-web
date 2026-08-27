'use server';

import type { UserSearchResult } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function searchUsers(query: string): Promise<UserSearchResult[]> {
  const trimmed = query.trim();

  if (!trimmed) {
    return [];
  }

  const { data } = await apiFetch<UserSearchResult[]>(
    `/users?q=${encodeURIComponent(trimmed)}`
  );

  return data ?? [];
}

export async function inviteCoauthor(
  mapId: number,
  userId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(`/maps/${mapId}/coauthorship_invitations`, {
    method: 'POST',
    body: JSON.stringify({ user_id: userId })
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function removeCoauthor(
  mapId: number,
  userId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(`/maps/${mapId}/coauthors/${userId}`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function acceptCoauthorshipInvitation(
  invitationId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `/me/coauthorship_invitations/${invitationId}/accept`,
    {
      method: 'POST'
    }
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function declineCoauthorshipInvitation(
  invitationId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(
    `/me/coauthorship_invitations/${invitationId}/decline`,
    {
      method: 'POST'
    }
  );

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
