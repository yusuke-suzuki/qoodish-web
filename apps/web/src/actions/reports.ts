'use server';

import { apiFetch } from '../lib/api.ts';
import type { ModeratableType, ReportCategory } from '../utils/reports.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function createReport(params: {
  moderatable_type: ModeratableType;
  moderatable_id: number;
  category: ReportCategory;
  details?: string;
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
