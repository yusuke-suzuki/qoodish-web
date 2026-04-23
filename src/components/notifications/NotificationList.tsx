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
import { formatDistanceToNow } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { memo, useContext, useEffect, useMemo, useRef } from 'react';
import type { Notification } from '../../../types';
import { markNotificationAsRead } from '../../actions/notifications';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import sleep from '../../utils/sleep';
import AuthorAvatar from '../common/AuthorAvatar';
import NoContents from '../common/NoContents';

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
  const { lang } = useParams<{ lang: string }>();
  const dictionary = useDictionary();

  const { authenticated } = useContext(AuthContext);

  const unreadNotifications = useMemo(
    () => notifications.filter((notification) => !notification.read),
    [notifications]
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
                    `${notification.key} ${notification.notifiable.type}`
                  ]
                }`}
              </Typography>
            }
            secondary={
              <Typography variant="subtitle1" color="text.secondary">
                {formatDistanceToNow(new Date(notification.created_at), {
                  addSuffix: true,
                  locale: lang === 'ja' ? ja : enUS
                })}
              </Typography>
            }
            disableTypography
          />
          {notification.notifiable.thumbnail_url && (
            <IconButton href={notification.click_action} LinkComponent={Link}>
              <Avatar
                src={notification.notifiable.thumbnail_url}
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
