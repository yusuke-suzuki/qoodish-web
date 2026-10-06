import { use, useContext } from 'react';
import type { CursorPage, Notification } from '../../types/index.ts';
import UnreadNotificationsContext from '../context/UnreadNotificationsContext.ts';

export default function useUnreadNotifications(): CursorPage<Notification> {
  return use(useContext(UnreadNotificationsContext));
}
