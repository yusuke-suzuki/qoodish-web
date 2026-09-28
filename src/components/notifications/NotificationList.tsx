'use client';

import { Notifications } from '@mui/icons-material';
import {
  Avatar,
  IconButton,
  ListItemAvatar,
  ListItemButton,
  ListItemText,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { memo, useContext, useEffect, useRef } from 'react';
import type { Notification } from '../../../types/index.ts';
import { markNotificationAsRead } from '../../actions/notifications.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useRelativeTime from '../../hooks/useRelativeTime.ts';
import { notificationMessageKey } from '../../utils/notificationMessage.ts';
import sleep from '../../utils/sleep.ts';
import AuthorAvatar from '../common/AuthorAvatar.tsx';
import NoContents from '../common/NoContents.tsx';

type Props = {
  notifications: Notification[];
  onReadNotifications: () => void;
  onNotificationClick?: () => void;
};

const NotificationList = ({
  notifications,
  onReadNotifications,
  onNotificationClick
}: Props) => {
  const dictionary = useDictionary();
  const formatRelativeTime = useRelativeTime();

  const { authenticated } = useContext(AuthContext);

  const unreadNotifications = notifications.filter(
    (notification) => !notification.read
  );

  const didMarkRef = useRef(false);

  useEffect(() => {
    if (
      !authenticated ||
      unreadNotifications.length < 1 ||
      didMarkRef.current
    ) {
      return;
    }

    didMarkRef.current = true;

    (async () => {
      for (const notification of unreadNotifications) {
        await markNotificationAsRead(notification.id);
        await sleep(3000);
      }

      onReadNotifications();
    })();
  }, [authenticated, unreadNotifications, onReadNotifications]);

  if (notifications.length < 1) {
    return (
      <NoContents
        icon={Notifications}
        message={dictionary['no notifications']}
      />
    );
  }

  return (
    <>
      {notifications.map((notification) => (
        <ListItemButton
          key={notification.id}
          href={notification.click_action}
          onClick={onNotificationClick}
          selected={!notification.read}
          LinkComponent={Link}
          dense
        >
          <ListItemAvatar>
            <AuthorAvatar author={notification.notifier} />
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="subtitle1">
                <strong>{notification.notifier.name}</strong>
                {` ${
                  dictionary[
                    notificationMessageKey(
                      notification.key,
                      notification.notifiable.type
                    )
                  ]
                }`}
              </Typography>
            }
            secondary={
              <Typography variant="subtitle1" color="text.secondary">
                {formatRelativeTime(notification.created_at)}
              </Typography>
            }
            disableTypography
          />
          {notification.notifiable.image && (
            <IconButton
              href={notification.click_action}
              LinkComponent={Link}
              title={dictionary.detail}
              aria-label={dictionary.detail}
            >
              <Avatar
                src={notification.notifiable.image.avatar}
                variant="rounded"
                slotProps={{
                  img: {
                    loading: 'lazy'
                  }
                }}
              />
            </IconButton>
          )}
        </ListItemButton>
      ))}
    </>
  );
};

export default memo(NotificationList);
