import React, { useEffect, useCallback } from 'react';
import { useDispatch } from 'redux-react-hook';

import moment from 'moment';
import ListItem from '@material-ui/core/ListItem';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import MenuItem from '@material-ui/core/MenuItem';
import Avatar from '@material-ui/core/Avatar';
import { Link } from 'react-router-dom';
import ButtonBase from '@material-ui/core/ButtonBase';
import Typography from '@material-ui/core/Typography';

import I18n from '../../utils/I18n';
import ApiClient from '../../utils/ApiClient';
import readNotification from '../../actions/readNotification';
import sleep from '../../utils/sleep';

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
    .locale(window.currentLocale)
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

  switch (notification.key) {
    case 'liked':
      return (
        <React.Fragment>
          <b>{notification.notifier.name}</b>
          {` ${I18n.t(`${notification.key} ${notification.notifiable.type}`)}`}
        </React.Fragment>
      );
    case 'comment':
      return (
        <React.Fragment>
          <b>{notification.notifier.name}</b>
          {` ${I18n.t('posted comment')}`}
        </React.Fragment>
      );
    default:
      return (
        <React.Fragment>
          <b>{notification.notifier.name}</b>
          {` ${I18n.t(notification.key)}`}
        </React.Fragment>
      );
  }
};

const NotificationList = props => {
  const dispatch = useDispatch();

  const handleReadNotification = useCallback(async () => {
    await sleep(5000);
    const client = new ApiClient();
    let unreadNotifications = props.notifications.filter(notification => {
      return notification.read === false;
    });
    unreadNotifications.forEach(async notification => {
      let response = await client.readNotification(notification.id);
      if (response.ok) {
        let notification = await response.json();
        dispatch(readNotification(notification));
      }
      await sleep(3000);
    });
  });

  useEffect(() => {
    handleReadNotification();
  });

  return props.notifications.map(notification => (
    <Item
      key={notification.id}
      onClick={props.handleNotificationClick}
      button
      component={Link}
      to={notification.click_action}
      item={props.item}
      style={props.menu ? styles.notificationMenuItem : {}}
    >
      <Avatar
        src={notification.notifier.profile_image_url}
        alt={notification.notifier.name}
      />
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
            />
          </ButtonBase>
        </ListItemSecondaryAction>
      )}
    </Item>
  ));
};

export default React.memo(NotificationList);
