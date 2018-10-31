import React from 'react';
import { Link } from 'react-router-dom';
import BottomNavigation from '@material-ui/core/BottomNavigation';
import BottomNavigationAction from '@material-ui/core/BottomNavigationAction';
import Paper from '@material-ui/core/Paper';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import MapIcon from '@material-ui/icons/Map';
import NotificationsIcon from '@material-ui/icons/Notifications';
import Badge from '@material-ui/core/Badge';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import I18n from '../containers/I18n';

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

const NotificationIcon = (props) => {
  if (props.unreadNotifications.length > 0) {
    return (
      <Badge
        badgeContent={props.unreadNotifications.length}
        color="secondary"
      >
        <NotificationsIcon />
      </Badge>
    );
  } else {
    return <NotificationsIcon />;
  }
}

const BottomNav = (props) => {
  return (
    <Paper style={styles.bottomNav} elevation={20}>
      <BottomNavigation value={props.bottomNavValue}>
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
        <BottomNavigationAction
          component={Link}
          to="/maps"
          title={I18n.t('maps')}
          icon={<MapIcon />}
          style={styles.bottomAction}
        />
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
          icon={<NotificationIcon {...props} />}
          style={styles.bottomAction}
        />
      </BottomNavigation>
    </Paper>
  );
}

export default BottomNav;
