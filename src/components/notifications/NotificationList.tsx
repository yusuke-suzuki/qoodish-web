'use client';

import { Notifications } from '@mui/icons-material';
import {
  Avatar,
  AvatarGroup,
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
import useCountLabel from '../../hooks/useCountLabel.ts';
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
  const countLabel = useCountLabel();
  const formatRelativeTime = useRelativeTime();

  const message = (notification: Notification) => {
    const messageKey = notificationMessageKey(
      notification.key,
      notification.notifiable.type
    );
    const othersCount = notification.notifiers_count - 1;

    return othersCount > 0
      ? countLabel(`${messageKey} others`, othersCount)
      : dictionary[messageKey];
  };

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
            {notification.notifiers.length > 1 ? (
              <AvatarGroup spacing="small">
                {notification.notifiers.map((notifier) => (
                  <Avatar
                    key={notifier.id}
                    src={notifier.image?.avatar}
                    alt={notifier.name}
                    slotProps={{
                      img: {
                        loading: 'lazy'
                      }
                    }}
                  />
                ))}
              </AvatarGroup>
            ) : (
              <AuthorAvatar author={notification.notifier} />
            )}
          </ListItemAvatar>
          <ListItemText
            primary={
              <Typography variant="subtitle1">
                <strong>{notification.notifier.name}</strong>
                {` ${message(notification)}`}
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
