import React, { useEffect, useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';

import moment from 'moment';
import ListItem from '@material-ui/core/ListItem';
import ListItemAvatar from '@material-ui/core/ListItemAvatar';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import { Link } from '@yusuke-suzuki/rize-router';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';

import I18n from '../../utils/I18n';
import readNotification from '../../actions/readNotification';
import sleep from '../../utils/sleep';
import {
  NotificationsApi,
  InlineObject1
} from '@yusuke-suzuki/qoodish-api-js-client';

const styles = {
  listItemText: {
    paddingRight: 32
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
};

const fromNow = notification => {
  return moment(notification.created_at, 'YYYY-MM-DDThh:mm:ss.SSSZ')
    .locale(I18n.locale)
    .fromNow();
};

const Item = props => {
  if (props.menu) {
    return <MenuItem {...props} />;
  } else {
    return <ListItem {...props} />;
  }
};

const NotificationText = props => {
  let notification = props.notification;

  return (
    <React.Fragment>
      <b>{notification.notifier.name}</b>
      {` ${I18n.t(`${notification.key} ${notification.notifiable.type}`)}`}
    </React.Fragment>
  );
};

const NotificationList = props => {
  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentUser: state.app.currentUser
    }),
    []
  );

  const { currentUser } = useMappedState(mapState);

  const handleReadNotification = useCallback(async () => {
    await sleep(5000);
    let unreadNotifications = props.notifications.filter(notification => {
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
  });

  useEffect(() => {
    if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
      return;
    }
    handleReadNotification();
  }, [currentUser.uid]);

  return props.notifications.map(notification => (
    <Item
      key={notification.id}
      onClick={props.handleNotificationClick}
      button
      component={Link}
      to={notification.click_action}
      item={props.item}
      style={props.menu ? styles.notificationMenuItem : {}}
      selected={!notification.read}
    >
      <ListItemAvatar>
        <Avatar
          src={notification.notifier.profile_image_url}
          alt={notification.notifier.name}
          loading="lazy"
        />
      </ListItemAvatar>
      <ListItemText
        style={styles.listItemText}
        primary={
          <Typography variant="subtitle1">
            <NotificationText notification={notification} />
          </Typography>
        }
        secondary={
          <Typography variant="subtitle1" color="textSecondary">
            {fromNow(notification)}
          </Typography>
        }
        disableTypography
      />
      {notification.notifiable.thumbnail_url && (
        <ListItemSecondaryAction onClick={props.handleNotificationClick}>
          <ButtonBase component={Link} to={notification.click_action}>
            <Avatar
              src={notification.notifiable.thumbnail_url}
              style={styles.secondaryAvatar}
              loading="lazy"
            />
          </ButtonBase>
        </ListItemSecondaryAction>
      )}
    </Item>
  ));
};

export default React.memo(NotificationList);
