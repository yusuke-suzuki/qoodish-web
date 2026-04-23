import { createContext } from 'react';
import type { Notification } from '../../types';

const NotificationsContext = createContext<Notification[]>([]);

export default NotificationsContext;
