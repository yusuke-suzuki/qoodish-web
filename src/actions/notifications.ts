'use server';

import { apiFetch } from '../lib/api';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function markNotificationAsRead(
  notificationId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(`/notifications/${notificationId}`, {
    method: 'PUT',
    body: JSON.stringify({ read: true })
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}
