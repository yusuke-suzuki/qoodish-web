'use client';

import { Box, CircularProgress, List } from '@mui/material';
import { useNotifications } from '../../hooks/useNotifications';
import NotificationList from './NotificationList';

export default function NotificationsFeed() {
  const { notifications, isLoading, mutate } = useNotifications();

  return isLoading ? (
    <Box
      sx={{
        display: 'grid',
        placeItems: 'center',
        my: 2
      }}
    >
      <CircularProgress />
    </Box>
  ) : (
    <List>
      <NotificationList
        notifications={notifications}
        onReadNotifications={mutate}
      />
    </List>
  );
}
