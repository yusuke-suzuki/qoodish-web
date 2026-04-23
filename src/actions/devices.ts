'use server';

import { apiFetch } from '../lib/api';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function registerDevice(
  registrationToken: string
): Promise<ActionResult> {
  const { error } = await apiFetch(`/devices/${registrationToken}`, {
    method: 'PUT'
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
