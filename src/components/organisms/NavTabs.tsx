import React, { useCallback, useState, useEffect } from 'react';
import { useMappedState } from 'redux-react-hook';

import Tabs from '@material-ui/core/Tabs';
import Tab from '@material-ui/core/Tab';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import NotificationsIcon from '@material-ui/icons/Notifications';

import Badge from '@material-ui/core/Badge';

import Link from 'next/link';

import NotificationsMenu from './NotificationsMenu';
import { createStyles, makeStyles } from '@material-ui/core';
import { useRouter } from 'next/router';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(() =>
  createStyles({
    tab: {
      height: 64,
      minHeight: 64,
      minWidth: 90
    }
  })
);

const NavTabs = () => {
  const [selectedValue, setSelectedValue] = useState<any>(false);
  const [anchorEl, setAnchorEl] = useState(undefined);
  const [notificationOpen, setNotificationOpen] = useState(false);

  const classes = useStyles();

  const mapState = useCallback(
    state => ({
      unreadNotifications: state.shared.unreadNotifications
    }),
    []
  );
  const { unreadNotifications } = useMappedState(mapState);

  const router = useRouter();
  const { I18n } = useLocale();

  const isSelected = useCallback(
    pathname => {
      return router.pathname === pathname;
    },
    [router]
  );

  const handleNotificationButtonClick = useCallback(e => {
    setNotificationOpen(true);
    setAnchorEl(e.currentTarget);
  }, []);

  const handleRequestNotificationClose = useCallback(() => {
    setNotificationOpen(false);
  }, []);

  useEffect(() => {
    switch (router.pathname) {
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
  }, [router.pathname]);

  return (
    <>
      <Tabs
        value={selectedValue}
        indicatorColor="secondary"
        textColor="inherit"
      >
        <Link href="/" passHref>
          <Tab
            icon={<HomeIcon />}
            selected={true}
            className={classes.tab}
            title={I18n.t('home')}
          />
        </Link>
        <Link href="/discover" passHref>
          <Tab
            icon={<ExploreIcon />}
            selected={isSelected('/discover')}
            className={classes.tab}
            title={I18n.t('discover')}
          />
        </Link>
        <Link href="/profile" passHref>
          <Tab
            icon={<AccountCircleIcon />}
            selected={isSelected('/profile')}
            className={classes.tab}
            title={I18n.t('account')}
          />
        </Link>
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
          className={classes.tab}
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
    </>
  );
};

export default React.memo(NavTabs);
