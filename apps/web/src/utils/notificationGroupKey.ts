import type { Notification } from '../../types/index.ts';

export function notificationGroupKey(notification: Notification): string {
  return [
    notification.key,
    notification.notifiable.type,
    notification.notifiable.id
  ].join(':');
}
