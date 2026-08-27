'use server';

import { apiFetch } from '../lib/api.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function bookmarkJournal(
  journalId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(`/journals/${journalId}/bookmark`, {
    method: 'POST'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function removeJournalBookmark(
  journalId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(`/journals/${journalId}/bookmark`, {
    method: 'DELETE'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
