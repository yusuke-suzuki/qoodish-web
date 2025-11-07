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
import { useRouter } from 'next/router';
import { memo, useCallback, useContext, useEffect } from 'react';
import type { Notification } from '../../../types';
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
  const router = useRouter();
  const dictionary = useDictionary();

  const { currentUser } = useContext(AuthContext);

  const unreadNotifications = notifications.filter((notification) => {
    return notification.read === false;
  });

  const handleReadNotification = useCallback(async () => {
    for (const notification of unreadNotifications) {
      const token = await currentUser.getIdToken();

      const headers = new Headers({
        Accept: 'application/json',
        'Accept-Language': window.navigator.language,
        'Content-Type': 'application/json; charset=UTF-8',
        Authorization: `Bearer ${token}`
      });

      const request = new Request(
        `${process.env.NEXT_PUBLIC_API_ENDPOINT}/notifications/${notification.id}`,
        {
          method: 'PUT',
          headers: headers,
          body: JSON.stringify({
            read: true
          })
        }
      );

      await fetch(request);

      await sleep(3000);
    }

    onReadNotifications();
  }, [unreadNotifications, currentUser, onReadNotifications]);

  useEffect(() => {
    if (!currentUser) {
      return;
    }

    if (unreadNotifications.length < 1) {
      return;
    }

    handleReadNotification();
  }, [currentUser, unreadNotifications, handleReadNotification]);

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
                  locale: router.locale === 'ja' ? ja : enUS
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
