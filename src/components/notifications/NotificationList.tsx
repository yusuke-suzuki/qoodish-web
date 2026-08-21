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
import { memo, useContext, useEffect, useRef, useState } from 'react';
import type { Notification } from '../../../types';
import { markNotificationAsRead } from '../../actions/notifications';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import { LOCAL_DATE_TIME_PLACEHOLDER } from '../../hooks/useLocalDateTime';
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

  // Server rendering resolves "now" and the time zone differently from the
  // browser, so the elapsed time is only rendered once mounted.
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

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
                    `${notification.key} ${notification.notifiable.type}`
                  ]
                }`}
              </Typography>
            }
            secondary={
              <Typography variant="subtitle1" color="text.secondary">
                {mounted
                  ? formatDistanceToNow(new Date(notification.created_at), {
                      addSuffix: true,
                      locale: lang === 'ja' ? ja : enUS
                    })
                  : LOCAL_DATE_TIME_PLACEHOLDER}
              </Typography>
            }
            disableTypography
          />
          {notification.notifiable.image && (
            <IconButton href={notification.click_action} LinkComponent={Link}>
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
