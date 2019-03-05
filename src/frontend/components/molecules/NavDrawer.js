import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import Drawer from '@material-ui/core/Drawer';
import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import Typography from '@material-ui/core/Typography';
import ListItemText from '@material-ui/core/ListItemText';
import Divider from '@material-ui/core/Divider';
import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';

import Link from './Link';
import I18n from '../../utils/I18n';

import openFeedbackDialog from '../../actions/openFeedbackDialog';
import openDrawer from '../../actions/openDrawer';
import closeDrawer from '../../actions/closeDrawer';

const styles = {
  title: {
    cursor: 'pointer'
  },
  titleLarge: {
    height: 64
  },
  titleSmall: {
    height: 56
  },
  drawerPaper: {
    marginTop: 84,
    zIndex: 1000,
    backgroundColor: 'initial',
    borderRight: 'initial',
    maxWidth: 230
  }
};

const Title = () => {
  const large = useMediaQuery('(min-width: 600px)');

  return (
    <ListItem
      divider
      component={Link}
      to="/"
      style={large ? styles.titleLarge : styles.titleSmall}
    >
      <ListItemText
        disableTypography
        primary={
          <Typography variant="h5" color="textSecondary" style={styles.title}>
            Qoodish
          </Typography>
        }
      />
    </ListItem>
  );
};

const DrawerContents = () => {
  const large = useMediaQuery('(min-width: 600px)');
  const mapState = useCallback(
    state => ({
      showSideNav: state.shared.showSideNav,
      currentLocation: state.shared.currentLocation
    }),
    []
  );
  const { showSideNav, currentLocation } = useMappedState(mapState);
  const dispatch = useDispatch();

  const handleFeedbackClick = useCallback(() => {
    dispatch(openFeedbackDialog());
  });

  const isSelected = useCallback(pathname => {
    return currentLocation && currentLocation.pathname === pathname;
  });

  return (
    <div>
      <List disablePadding component="nav">
        {!large || !showSideNav ? <Title /> : null}
        <ListItem button component={Link} to="/" title={I18n.t('home')}>
          <ListItemIcon>
            <HomeIcon color={isSelected('/') ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText
            primary={I18n.t('home')}
            primaryTypographyProps={isSelected('/') ? { color: 'primary' } : {}}
          />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/discover"
          title={I18n.t('discover')}
        >
          <ListItemIcon>
            <ExploreIcon
              color={isSelected('/discover') ? 'primary' : 'inherit'}
            />
          </ListItemIcon>
          <ListItemText
            primary={I18n.t('discover')}
            primaryTypographyProps={
              isSelected('/discover') ? { color: 'primary' } : {}
            }
          />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/profile"
          title={I18n.t('account')}
        >
          <ListItemIcon>
            <AccountCircleIcon
              color={isSelected('/profile') ? 'primary' : 'inherit'}
            />
          </ListItemIcon>
          <ListItemText
            primary={I18n.t('account')}
            primaryTypographyProps={
              isSelected('/profile') ? { color: 'primary' } : {}
            }
          />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/notifications"
          title={I18n.t('notifications')}
        >
          <ListItemIcon>
            <NotificationsIcon
              color={isSelected('/notifications') ? 'primary' : 'inherit'}
            />
          </ListItemIcon>
          <ListItemText
            primary={I18n.t('notifications')}
            primaryTypographyProps={
              isSelected('/notifications') ? { color: 'primary' } : {}
            }
          />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/settings"
          title={I18n.t('settings')}
        >
          <ListItemIcon>
            <SettingsIcon
              color={isSelected('/settings') ? 'primary' : 'inherit'}
            />
          </ListItemIcon>
          <ListItemText
            primary={I18n.t('settings')}
            primaryTypographyProps={
              isSelected('/settings') ? { color: 'primary' } : {}
            }
          />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/invites"
          title={I18n.t('invites')}
        >
          <ListItemIcon>
            <MailIcon color={isSelected('/invites') ? 'primary' : 'inherit'} />
          </ListItemIcon>
          <ListItemText
            primary={I18n.t('invites')}
            primaryTypographyProps={
              isSelected('/invites') ? { color: 'primary' } : {}
            }
          />
        </ListItem>
        <Divider />
        <ListItem button onClick={handleFeedbackClick}>
          <ListItemText
            primary={I18n.t('send feedback')}
            primaryTypographyProps={{ color: 'textSecondary' }}
          />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/terms"
          title={I18n.t('terms of service')}
        >
          <ListItemText
            primary={I18n.t('terms of service')}
            primaryTypographyProps={{ color: 'textSecondary' }}
          />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/privacy"
          title={I18n.t('privacy policy')}
        >
          <ListItemText
            primary={I18n.t('privacy policy')}
            primaryTypographyProps={{ color: 'textSecondary' }}
          />
        </ListItem>
      </List>
    </div>
  );
};

const Swipeable = () => {
  const dispatch = useDispatch();
  const drawerOpen = useMappedState(
    useCallback(state => state.shared.drawerOpen, [])
  );
  const handleOpenDrawer = useCallback(() => {
    dispatch(openDrawer());
  });
  const handleCloseDrawer = useCallback(() => {
    dispatch(closeDrawer());
  });

  return (
    <SwipeableDrawer
      open={drawerOpen}
      onOpen={handleOpenDrawer}
      onClose={handleCloseDrawer}
      onClick={handleCloseDrawer}
    >
      <DrawerContents />
    </SwipeableDrawer>
  );
};

const Temporary = () => {
  const dispatch = useDispatch();
  const drawerOpen = useMappedState(
    useCallback(state => state.shared.drawerOpen, [])
  );
  const handleCloseDrawer = useCallback(() => {
    dispatch(closeDrawer());
  });

  return (
    <Drawer
      open={drawerOpen}
      onClose={handleCloseDrawer}
      onClick={handleCloseDrawer}
    >
      <DrawerContents />
    </Drawer>
  );
};

const Permanent = () => {
  const dispatch = useDispatch();
  const drawerOpen = useMappedState(
    useCallback(state => state.shared.drawerOpen, [])
  );
  const handleCloseDrawer = useCallback(() => {
    dispatch(closeDrawer());
  });

  return (
    <Drawer
      variant="permanent"
      anchor="left"
      PaperProps={{ style: styles.drawerPaper }}
      open={drawerOpen}
      onClose={handleCloseDrawer}
      onClick={handleCloseDrawer}
    >
      <DrawerContents />
    </Drawer>
  );
};

const DrawerLarge = () => {
  const showSideNav = useMappedState(
    useCallback(state => state.shared.showSideNav, [])
  );

  return showSideNav ? <Permanent /> : <Temporary />;
};

const NavDrawer = () => {
  const large = useMediaQuery('(min-width: 600px)');
  return large ? <DrawerLarge /> : <Swipeable />;
};

export default React.memo(NavDrawer);
