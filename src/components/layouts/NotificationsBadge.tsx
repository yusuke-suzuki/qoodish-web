import { Notifications } from '@mui/icons-material';
import { Badge } from '@mui/material';
import { memo, Suspense } from 'react';
import useNotifications from '../../hooks/useNotifications.ts';

function UnreadBadge() {
  const notifications = useNotifications();

  const unreadCount = notifications.filter(
    (notification) => notification.read === false
  ).length;

  return (
    <Badge badgeContent={unreadCount} color="secondary">
      <Notifications />
    </Badge>
  );
}

export default memo(function NotificationsBadge() {
  return (
    <Suspense fallback={<Notifications />}>
      <UnreadBadge />
    </Suspense>
  );
});
