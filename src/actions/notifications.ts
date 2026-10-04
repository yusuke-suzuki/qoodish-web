'use server';

import type { NotificationsPage } from '../../types/index.ts';
import { apiFetch } from '../lib/api.ts';
import { getNotifications } from '../lib/users.ts';

type ActionResult = {
  success: boolean;
  error?: string;
};

export async function markNotificationAsRead(
  notificationId: number
): Promise<ActionResult> {
  const { error } = await apiFetch(`/me/notifications/${notificationId}`, {
    method: 'PUT',
    body: JSON.stringify({ read: true })
  });

  if (error) {
    return { success: false, error };
  }

  return { success: true };
}

export async function fetchMoreNotifications(
  lang: string,
  cursor: string
): Promise<NotificationsPage> {
  return getNotifications(lang, { cursor });
}
