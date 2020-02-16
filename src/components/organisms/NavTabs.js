import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState } from 'redux-react-hook';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import NotificationsIcon from '@material-ui/icons/Notifications';

import Badge from '@material-ui/core/Badge';

import { Link } from '@yusuke-suzuki/rize-router';
import I18n from '../../utils/I18n';

import NotificationsMenu from './NotificationsMenu';

const styles = {
  tab: {
    height: 64,
    minHeight: 64,
    minWidth: 90
  }
};

const NavTabs = () => {
  const [selectedValue, setSelectedValue] = useState(false);
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const mapState = useCallback(
    state => ({
      currentLocation: state.shared.currentLocation,
      unreadNotifications: state.shared.unreadNotifications
    }),
    []
  );
  const { currentLocation, unreadNotifications } = useMappedState(mapState);

  const isSelected = useCallback(
    pathname => {
      return currentLocation && currentLocation.pathname === pathname;
    },
    [currentLocation]
  );

  const handleNotificationButtonClick = useCallback(e => {
    setNotificationOpen(true);
    setAnchorEl(e.currentTarget);
  }, []);

  const handleRequestNotificationClose = useCallback(() => {
    setNotificationOpen(false);
  }, []);

  useEffect(() => {
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
  }, [currentLocation]);

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

      <NotificationsMenu
        anchorEl={anchorEl}
        open={notificationOpen}
        onClose={handleRequestNotificationClose}
      />
    </div>
  );
};

export default React.memo(NavTabs);
