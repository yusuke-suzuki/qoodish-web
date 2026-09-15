'use server';

import { apiFetch } from '../lib/api.ts';
import devicePath from '../utils/devicePath.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

async function requestDevice(
  registrationToken: string,
  method: 'PUT' | 'DELETE'
): Promise<ActionResult> {
  const path = devicePath(registrationToken);

  if (!path) {
    return { success: false, error: 'Invalid registration token' };
  }

  const { error } = await apiFetch(path, { method });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function registerDevice(
  registrationToken: string
): Promise<ActionResult> {
  return requestDevice(registrationToken, 'PUT');
}

export async function unregisterDevice(
  registrationToken: string
): Promise<ActionResult> {
  return requestDevice(registrationToken, 'DELETE');
}
