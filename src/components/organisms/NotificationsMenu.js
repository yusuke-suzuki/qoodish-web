import React, { useCallback, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Typography from '@material-ui/core/Typography';
import NotificationsIcon from '@material-ui/icons/Notifications';

import NotificationList from './NotificationList';

import fetchNotifications from '../../actions/fetchNotifications';
import readNotification from '../../actions/readNotification';

import sleep from '../../utils/sleep';
import {
  NotificationsApi,
  InlineObject1
} from '@yusuke-suzuki/qoodish-api-js-client';

import I18n from '../../utils/I18n';

const styles = {
  notificationMenu: {
    maxHeight: '50vh'
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

const NotificationsMenu = props => {
  const { open, onClose, anchorEl } = props;

  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      notifications: state.shared.notifications,
      currentUser: state.app.currentUser
    }),
    []
  );
  const { notifications, currentUser } = useMappedState(mapState);

  const onEntered = useCallback(async () => {
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
  });

  const refreshNotifications = useCallback(async () => {
    const apiInstance = new NotificationsApi();

    apiInstance.notificationsGet((error, data, response) => {
      if (response.ok) {
        dispatch(fetchNotifications(response.body));
      }
    });
  }, [dispatch]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
      return;
    }
    refreshNotifications();
  }, [currentUser, currentUser.uid]);

  return (
    <Menu
      id="notification-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onEntered={onEntered}
      PaperProps={{ style: styles.notificationMenu }}
    >
      {notifications.length > 0 ? (
        <NotificationList
          notifications={notifications}
          handleNotificationClick={onClose}
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
  );
};

export default React.memo(NotificationsMenu);
