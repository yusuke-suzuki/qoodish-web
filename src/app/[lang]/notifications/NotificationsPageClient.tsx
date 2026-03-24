'use client';

import { Box, CircularProgress, List } from '@mui/material';
import Layout from '../../../components/Layout';
import NotificationList from '../../../components/notifications/NotificationList';
import { useNotifications } from '../../../hooks/useNotifications';

export default function NotificationsPageClient() {
  const { notifications, isLoading, mutate } = useNotifications();

  return (
    <Layout fullWidth>
      {isLoading ? (
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
      )}
    </Layout>
  );
}
