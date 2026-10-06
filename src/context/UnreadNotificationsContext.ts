import { createContext } from 'react';
import type { CursorPage, Notification } from '../../types/index.ts';

const UnreadNotificationsContext = createContext<
  Promise<CursorPage<Notification>>
>(Promise.resolve({ items: [], nextCursor: null }));

export default UnreadNotificationsContext;
