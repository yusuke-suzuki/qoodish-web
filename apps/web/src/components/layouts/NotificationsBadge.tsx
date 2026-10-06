import { Notifications } from '@mui/icons-material';
import { Badge } from '@mui/material';
import { memo, Suspense } from 'react';
import useUnreadNotifications from '../../hooks/useUnreadNotifications.ts';

function UnreadBadge() {
  const { items, nextCursor } = useUnreadNotifications();
  const count = items.length;

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
