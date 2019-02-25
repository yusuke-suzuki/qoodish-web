import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import IconButton from '@material-ui/core/IconButton';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';

import NotificationList from './NotificationList';

import readNotification from '../../actions/readNotification';
import sleep from '../../utils/sleep';
import I18n from '../../utils/I18n';
import initializeApiClient from '../../utils/initializeApiClient';
import { NotificationsApi, InlineObject3 } from 'qoodish_api';

const styles = {
  notificationMenu: {
    maxHeight: '50vh'
  },
  notificationButton: {
    marginLeft: 10,
    marginRight: 10
  },
  noContents: {
    textAlign: 'center',
    color: '#9e9e9e',
    height: 'auto',
    display: 'flow-root'
  },
  noContentsIcon: {
    width: 80,
    height: 80
  }
};

const NotificationMenu = () => {
  const large = useMediaQuery('(min-width: 600px)');

  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      notifications: state.shared.notifications,
      unreadNotifications: state.shared.unreadNotifications
    }),
    []
  );
  const { notifications, unreadNotifications } = useMappedState(mapState);

  const [anchorEl, setAnchorEl] = useState(undefined);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const handleNotificationButtonClick = useCallback(e => {
    setNotificationOpen(true);
    setAnchorEl(e.currentTarget);
  });

  const handleRequestNotificationClose = useCallback(() => {
    setNotificationOpen(false);
  });

  const onEntered = useCallback(async () => {
    await sleep(5000);
    let unreadNotifications = notifications.filter(notification => {
      return notification.read === false;
    });
    unreadNotifications.forEach(async notification => {
      await initializeApiClient();
      const apiInstance = new NotificationsApi();
      const opts = {
        inlineObject3: InlineObject3.constructFromObject({ read: true })
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

  return (
    <div>
      <IconButton
        aria-label="Notification"
        aria-owns={notificationOpen ? 'notification-menu' : null}
        aria-haspopup="true"
        onClick={handleNotificationButtonClick}
        style={large ? styles.notificationButton : {}}
        color="inherit"
      >
        {unreadNotifications.length > 0 ? (
          <Badge badgeContent={unreadNotifications.length} color="secondary">
            <NotificationsIcon />
          </Badge>
        ) : (
          <NotificationsIcon />
        )}
      </IconButton>
      <Menu
        id="notification-menu"
        anchorEl={anchorEl}
        open={notificationOpen}
        onClose={handleRequestNotificationClose}
        onEntered={onEntered}
        PaperProps={{ style: styles.notificationMenu }}
      >
        {notifications.length > 0 ? (
          <NotificationList
            notifications={notifications}
            handleNotificationClick={handleRequestNotificationClose}
            menu={true}
          />
        ) : (
          <MenuItem style={styles.noContents}>
            <NotificationsIcon style={styles.noContentsIcon} />
            <Typography variant="subtitle1" color="inherit">
              {I18n.t('no notifications')}
            </Typography>
          </MenuItem>
        )}
      </Menu>
    </div>
  );
};

export default React.memo(NotificationMenu);
