import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState, useDispatch } from 'redux-react-hook';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import NotificationsIcon from '@material-ui/icons/Notifications';

import Menu from '@material-ui/core/Menu';
import MenuItem from '@material-ui/core/MenuItem';
import Badge from '@material-ui/core/Badge';
import Typography from '@material-ui/core/Typography';

import NotificationList from './NotificationList';

import readNotification from '../../actions/readNotification';
import sleep from '../../utils/sleep';
import { NotificationsApi, InlineObject1 } from 'qoodish_api';

import Link from '../molecules/Link';
import I18n from '../../utils/I18n';

const styles = {
  tab: {
    height: 64,
    minHeight: 64,
    minWidth: 90
  },
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

const NavTabs = () => {
  const [selectedValue, setSelectedValue] = useState(false);
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const dispatch = useDispatch();

  const mapState = useCallback(
    state => ({
      currentLocation: state.shared.currentLocation,
      notifications: state.shared.notifications,
      unreadNotifications: state.shared.unreadNotifications
    }),
    []
  );
  const {
    currentLocation,
    notifications,
    unreadNotifications
  } = useMappedState(mapState);

  const isSelected = pathname => {
    return currentLocation && currentLocation.pathname === pathname;
  };

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

  useEffect(
    () => {
      if (!currentLocation) {
        return;
      }
      switch (currentLocation.pathname) {
        case '/':
          setSelectedValue(0);
          break;
        case '/discover':
          setSelectedValue(1);
          break;
        case '/profile':
          setSelectedValue(2);
          break;
        default:
          setSelectedValue(false);
      }
    },
    [currentLocation]
  );

  return (
    <div>
      <Tabs
        value={selectedValue}
        indicatorColor="secondary"
        textColor="inherit"
      >
        <Tab
          icon={<HomeIcon />}
          selected={true}
          style={styles.tab}
          component={Link}
          to="/"
          title={I18n.t('home')}
        />
        <Tab
          icon={<ExploreIcon />}
          selected={isSelected('/discover')}
          style={styles.tab}
          component={Link}
          to="/discover"
          title={I18n.t('discover')}
        />
        <Tab
          icon={<AccountCircleIcon />}
          selected={isSelected('/profile')}
          style={styles.tab}
          component={Link}
          to="/profile"
          title={I18n.t('account')}
        />
        <Tab
          icon={
            unreadNotifications.length > 0 ? (
              <Badge
                badgeContent={unreadNotifications.length}
                color="secondary"
              >
                <NotificationsIcon />
              </Badge>
            ) : (
              <NotificationsIcon />
            )
          }
          style={styles.tab}
          title={I18n.t('notifications')}
          aria-label="Notification"
          aria-owns={notificationOpen ? 'notification-menu' : null}
          aria-haspopup="true"
          onClick={handleNotificationButtonClick}
        />
      </Tabs>
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

export default React.memo(NavTabs);
