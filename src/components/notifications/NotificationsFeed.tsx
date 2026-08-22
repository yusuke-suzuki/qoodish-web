'use client';
import { List } from '@mui/material';
import { useRouter } from 'next/navigation';
import type { Notification } from '../../../types';
import NotificationList from './NotificationList';

type Props = {
  notifications: Notification[];
};

export default function NotificationsFeed({ notifications }: Props) {
  const router = useRouter();

  const handleReadNotifications = () => {
    router.refresh();
  };

  return (
    <List>
      <NotificationList
        notifications={notifications}
        onReadNotifications={handleReadNotifications}
      />
    </List>
  );
}
