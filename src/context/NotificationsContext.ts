import { createContext } from 'react';
import type { Notification } from '../../types/index.ts';

const NotificationsContext = createContext<Notification[]>([]);

export default NotificationsContext;
