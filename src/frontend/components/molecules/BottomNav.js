import React, { useCallback } from 'react';
import { useMappedState } from 'redux-react-hook';
import Link from './Link';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Paper from '@material-ui/core/Paper';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import I18n from '../../utils/I18n';
import CreateResourceButton from './CreateResourceButton';

const styles = {
  bottomNav: {
    width: '100%',
    position: 'fixed',
    bottom: 0,
    zIndex: 1
  },
  bottomAction: {
    width: '20%',
    minWidth: 'auto',
    paddingTop: 8
  },
  link: {
    textDecoration: 'none',
    color: 'inherit'
  }
};

const NotificationIcon = () => {
  const unreadNotifications = useMappedState(
    useCallback(state => state.shared.unreadNotifications, [])
  );

  if (unreadNotifications.length > 0) {
    return (
      <Badge badgeContent={unreadNotifications.length} color="secondary">
        <NotificationsIcon />
      </Badge>
    );
  } else {
    return <NotificationsIcon />;
  }
};

const BottomNav = () => {
  const bottomNavValue = useMappedState(
    useCallback(state => state.shared.bottomNavValue, [])
  );

  return (
    <Paper style={styles.bottomNav} elevation={20}>
      <BottomNavigation value={bottomNavValue}>
        <BottomNavigationAction
          component={Link}
          to="/"
          title={I18n.t('home')}
          icon={<HomeIcon />}
          style={styles.bottomAction}
        />
        <BottomNavigationAction
          component={Link}
          to="/discover"
          title={I18n.t('discover')}
          icon={<ExploreIcon />}
          style={styles.bottomAction}
        />
        <CreateResourceButton bottomAction />
        <BottomNavigationAction
          component={Link}
          to="/profile"
          title={I18n.t('account')}
          icon={<AccountCircleIcon />}
          style={styles.bottomAction}
        />
        <BottomNavigationAction
          component={Link}
          to="/notifications"
          title={I18n.t('notice')}
          icon={<NotificationIcon />}
          style={styles.bottomAction}
        />
      </BottomNavigation>
    </Paper>
  );
};

export default React.memo(BottomNav);
