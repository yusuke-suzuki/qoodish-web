'use server';

import { apiFetch } from '../lib/api.ts';

export type ModeratableType = 'Review' | 'Comment' | 'Map' | 'Chapter' | 'User';

export const REPORT_CATEGORIES = [
  'spam',
  'harassment',
  'hate',
  'sexual',
  'violence',
  'illegal',
  'privacy',
  'copyright',
  'impersonation',
  'other'
] as const;

export type ReportCategory = (typeof REPORT_CATEGORIES)[number];

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createReport(params: {
  moderatable_type: ModeratableType;
  moderatable_id: number;
  category: ReportCategory;
  details?: string;
  evidence_url?: string;
}): Promise<ActionResult> {
  const { error } = await apiFetch('/reports', {
    method: 'POST',
    body: JSON.stringify(params)
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
