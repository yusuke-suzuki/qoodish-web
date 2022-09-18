import React, { useEffect, useCallback, useContext, memo } from 'react';
import { useDispatch } from 'redux-react-hook';

import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import Link from 'next/link';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';

import readNotification from '../../actions/readNotification';
import sleep from '../../utils/sleep';
import {
  NotificationsApi,
  InlineObject1
} from '@yusuke-suzuki/qoodish-api-js-client';
import AuthContext from '../../context/AuthContext';
import { createStyles, makeStyles, Theme } from '@material-ui/core';
import { formatDistanceToNow } from 'date-fns';
import { enUS, ja } from 'date-fns/locale';
import { useLocale } from '../../hooks/useLocale';
import { useRouter } from 'next/router';

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    listItemText: {
      paddingRight: theme.spacing(4)
    },
    secondaryAvatar: {
      borderRadius: 0,
      marginRight: 12,
      cursor: 'pointer'
    },
    notificationMenuItem: {
      height: 'auto',
      whiteSpace: 'initial'
    }
  })
);

const Item = props => {
  const { menu } = props;

  if (menu) {
    return <MenuItem {...props} />;
  } else {
    return <ListItem {...props} />;
  }
};

type NotificationTextProps = {
  notification: any;
};

const NotificationText = memo((props: NotificationTextProps) => {
  const { notification } = props;
  const { I18n } = useLocale();

  return (
    <>
      <b>{notification.notifier.name}</b>
      {` ${I18n.t(`${notification.key} ${notification.notifiable.type}`)}`}
    </>
  );
});

type Props = {
  menu?: boolean;
  notifications: any;
  handleNotificationClick: any;
};

const NotificationList = (props: Props) => {
  const { menu, notifications, handleNotificationClick } = props;
  const dispatch = useDispatch();
  const classes = useStyles();
  const router = useRouter();

  const { currentUser } = useContext(AuthContext);

  const handleReadNotification = useCallback(async () => {
    await sleep(5000);
    let unreadNotifications = notifications.filter(notification => {
      return notification.read === false;
    });
    unreadNotifications.forEach(async notification => {
      const apiInstance = new NotificationsApi();
      const opts = {
        inlineObject1: InlineObject1.constructFromObject({ read: true })
      };
      apiInstance.notificationsNotificationIdPut(
        notification.id,
        opts,
        async (error, data, response) => {
          if (response.ok) {
            dispatch(readNotification(response.body));
            await sleep(3000);
          }
        }
      );
    });
  }, [dispatch]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
      return;
    }
    handleReadNotification();
  }, [currentUser]);

  return notifications.map(notification => (
    <Link key={notification.id} href={notification.click_action} passHref>
      <Item
        onClick={handleNotificationClick}
        button
        className={menu ? classes.notificationMenuItem : null}
        selected={!notification.read}
      >
        <ListItemAvatar>
          <Avatar
            src={notification.notifier.profile_image_url}
            alt={notification.notifier.name}
            imgProps={{
              loading: 'lazy'
            }}
          />
        </ListItemAvatar>
        <ListItemText
          className={classes.listItemText}
          primary={
            <Typography variant="subtitle1">
              <NotificationText notification={notification} />
            </Typography>
          }
          secondary={
            <Typography variant="subtitle1" color="textSecondary">
              {formatDistanceToNow(new Date(notification.created_at), {
                addSuffix: true,
                locale: router.locale === 'ja' ? ja : enUS
              })}
            </Typography>
          }
          disableTypography
        />
        {notification.notifiable.thumbnail_url && (
          <ListItemSecondaryAction onClick={handleNotificationClick}>
            <Link href={notification.click_action} passHref>
              <ButtonBase>
                <Avatar
                  src={notification.notifiable.thumbnail_url}
                  className={classes.secondaryAvatar}
                  imgProps={{
                    loading: 'lazy'
                  }}
                />
              </ButtonBase>
            </Link>
          </ListItemSecondaryAction>
        )}
      </Item>
    </Link>
  ));
};

export default React.memo(NotificationList);
