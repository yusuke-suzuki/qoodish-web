import React, { useCallback, useContext, useEffect } from 'react';
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
  ApiClient,
  NotificationsApi,
  InlineObject1
} from '@yusuke-suzuki/qoodish-api-js-client';

import AuthContext from '../../context/AuthContext';
import { createStyles, makeStyles } from '@material-ui/core';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(() =>
  createStyles({
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
  })
);

type Props = {
  open: boolean;
  onClose: any;
  anchorEl: Element;
};

const NotificationsMenu = (props: Props) => {
  const { open, onClose, anchorEl } = props;

  const classes = useStyles();
  const { I18n } = useLocale();

  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      notifications: state.shared.notifications
    }),
    []
  );
  const { notifications } = useMappedState(mapState);

  const { currentUser } = useContext(AuthContext);

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
  }, [dispatch, notifications]);

  const refreshNotifications = useCallback(async () => {
    const apiInstance = new NotificationsApi();
    const firebaseAuth = ApiClient.instance.authentications['firebaseAuth'];
    firebaseAuth.apiKey = await currentUser.getIdToken();
    firebaseAuth.apiKeyPrefix = 'Bearer';

    apiInstance.notificationsGet((error, data, response) => {
      if (response.ok) {
        dispatch(fetchNotifications(response.body));
      }
    });
  }, [dispatch, currentUser]);

  useEffect(() => {
    if (!currentUser || !currentUser.uid || currentUser.isAnonymous) {
      return;
    }

    refreshNotifications();
  }, [currentUser]);

  return (
    <Menu
      id="notification-menu"
      anchorEl={anchorEl}
      open={open}
      onClose={onClose}
      onEntered={onEntered}
      PaperProps={{ className: classes.notificationMenu }}
    >
      {notifications.length > 0 ? (
        <NotificationList
          notifications={notifications}
          handleNotificationClick={onClose}
          menu={true}
        />
      ) : (
        <MenuItem className={classes.noContents}>
          <NotificationsIcon className={classes.noContentsIcon} />
          <Typography variant="subtitle1" color="inherit">
            {I18n.t('no notifications')}
          </Typography>
        </MenuItem>
      )}
    </Menu>
  );
};

export default React.memo(NotificationsMenu);
