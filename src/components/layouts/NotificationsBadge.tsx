import { Notifications } from '@mui/icons-material';
import { Badge } from '@mui/material';
import { memo, Suspense } from 'react';
import useUnreadNotifications from '../../hooks/useUnreadNotifications.ts';

function UnreadBadge() {
  const { notifications, nextCursor } = useUnreadNotifications();
  const count = notifications.length;

  return (
    <Badge badgeContent={nextCursor ? `${count}+` : count} color="secondary">
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
