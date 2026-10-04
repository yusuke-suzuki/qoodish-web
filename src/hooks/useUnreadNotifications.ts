import { use, useContext } from 'react';
import type { NotificationsPage } from '../../types/index.ts';
import UnreadNotificationsContext from '../context/UnreadNotificationsContext.ts';

export default function useUnreadNotifications(): NotificationsPage {
  return use(useContext(UnreadNotificationsContext));
}
