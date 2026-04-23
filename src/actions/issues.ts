'use server';

import { apiFetch } from '../lib/api';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createIssue(params: {
  content_id: number;
  content_type: string;
  reason_id: number;
}): Promise<ActionResult> {
  const { error } = await apiFetch('/inappropriate_contents', {
    method: 'POST',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
