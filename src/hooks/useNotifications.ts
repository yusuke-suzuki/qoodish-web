import { use, useContext } from 'react';
import type { Notification } from '../../types/index.ts';
import NotificationsContext from '../context/NotificationsContext.ts';

export default function useNotifications(): Notification[] {
  return use(useContext(NotificationsContext));
}
