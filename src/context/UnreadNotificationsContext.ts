import { createContext } from 'react';
import type { NotificationsPage } from '../../types/index.ts';

const UnreadNotificationsContext = createContext<Promise<NotificationsPage>>(
  Promise.resolve({ notifications: [], nextCursor: null })
);

export default UnreadNotificationsContext;
