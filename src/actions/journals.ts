'use server';

import type { Journal } from '../../types';
import { apiFetch } from '../lib/api';

type ActionResult<T = null> = {
  success: boolean;
  data?: T;
  error?: string;
};

type UpdateJournalParams = {
  title?: string;
  description?: string;
};

export async function updateJournal(
  journalId: number,
  params: UpdateJournalParams
): Promise<ActionResult<Journal>> {
  const { data, error } = await apiFetch<Journal>(`/journals/${journalId}`, {
    method: 'PUT',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true, data };
}
