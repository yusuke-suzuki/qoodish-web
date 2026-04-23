'use client';

import { List } from '@mui/material';
import { useRouter } from 'next/navigation';
import { useCallback } from 'react';
import type { Notification } from '../../../types';
import NotificationList from './NotificationList';

type Props = {
  initialNotifications: Notification[];
};

export default function NotificationsFeed({ initialNotifications }: Props) {
  const router = useRouter();

  const handleReadNotifications = useCallback(() => {
    router.refresh();
  }, [router]);

  return (
    <List>
      <NotificationList
        notifications={initialNotifications}
        onReadNotifications={handleReadNotifications}
      />
    </List>
  );
}
