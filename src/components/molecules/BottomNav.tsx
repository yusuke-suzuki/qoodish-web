import { memo, useCallback, useEffect, useState } from 'react';
import { useMappedState } from 'redux-react-hook';
import CreateResourceButton from './CreateResourceButton';
import { useRouter } from 'next/router';
import {
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  makeStyles,
  Paper
} from '@material-ui/core';
import {
  AccountCircle,
  Explore,
  Home,
  Notifications
} from '@material-ui/icons';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(() => ({
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
  },
  createButton: {
    position: 'relative',
    bottom: 28
  }
}));

const NotificationIcon = memo(() => {
  const unreadNotifications = useMappedState(
    useCallback(state => state.shared.unreadNotifications, [])
  );

  if (unreadNotifications.length > 0) {
    return (
      <Badge badgeContent={unreadNotifications.length} color="secondary">
        <Notifications />
      </Badge>
    );
  } else {
    return <Notifications />;
  }
});

export default memo(function BottomNav() {
  const [bottomNavValue, setBottomNavValue] = useState<number | undefined>(
    undefined
  );

  const { I18n } = useLocale();
  const router = useRouter();

  const { pathname } = router;

  const handleLinkClick = useCallback(
    path => {
      router.push(path);
    },
    [router]
  );

  const classes = useStyles();

  useEffect(() => {
    switch (pathname) {
      case '/':
        setBottomNavValue(0);
        break;
      case '/discover':
        setBottomNavValue(1);
        break;
      case '/profile':
        setBottomNavValue(3);
        break;
      case '/notifications':
        setBottomNavValue(4);
        break;
      default:
        setBottomNavValue(0);
    }
  }, [pathname]);

  return (
    <Paper className={classes.bottomNav} elevation={20}>
      <BottomNavigation value={bottomNavValue}>
        <BottomNavigationAction
          title={I18n.t('home')}
          icon={<Home />}
          className={classes.bottomAction}
          onClick={() => handleLinkClick('/')}
          showLabel
        />
        <BottomNavigationAction
          title={I18n.t('discover')}
          icon={<Explore />}
          className={classes.bottomAction}
          onClick={() => handleLinkClick('/discover')}
          showLabel
        />
        <div className={classes.createButton}>
          <CreateResourceButton />
        </div>
        <BottomNavigationAction
          title={I18n.t('account')}
          icon={<AccountCircle />}
          className={classes.bottomAction}
          onClick={() => handleLinkClick('/profile')}
          showLabel
        />
        <BottomNavigationAction
          title={I18n.t('notice')}
          icon={<NotificationIcon />}
          className={classes.bottomAction}
          onClick={() => handleLinkClick('/notifications')}
          showLabel
        />
      </BottomNavigation>
    </Paper>
  );
});
