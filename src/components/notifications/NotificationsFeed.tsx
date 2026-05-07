'use client';

import { List } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { Notification } from '../../../types';
import NotificationList from './NotificationList';

type Props = {
  notifications: Notification[];
};

export default function NotificationsFeed({ notifications }: Props) {
  const router = useRouter();

  const handleReadNotifications = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <List>
      <NotificationList
        notifications={notifications}
        onReadNotifications={handleReadNotifications}
      />
    </List>
  );
}
