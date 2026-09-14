import { createContext } from 'react';
import type { Notification } from '../../types/index.ts';

const NotificationsContext = createContext<Promise<Notification[]>>(
  Promise.resolve([])
);

export default NotificationsContext;
