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
  const showSideNav = useMappedState(
    useCallback(state => state.shared.showSideNav, [])
  );
  const dispatch = useDispatch();

  const handleFeedbackClick = useCallback(() => {
    dispatch(openFeedbackDialog());
  });

  return (
    <div>
      <List disablePadding component="nav">
        {!large || !showSideNav ? <Title /> : null}
        <ListItem button component={Link} to="/" title={I18n.t('home')}>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText primary={I18n.t('home')} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/discover"
          title={I18n.t('discover')}
        >
          <ListItemIcon>
            <ExploreIcon />
          </ListItemIcon>
          <ListItemText primary={I18n.t('discover')} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/profile"
          title={I18n.t('account')}
        >
          <ListItemIcon>
            <AccountCircleIcon />
          </ListItemIcon>
          <ListItemText primary={I18n.t('account')} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/notifications"
          title={I18n.t('notifications')}
        >
          <ListItemIcon>
            <NotificationsIcon />
          </ListItemIcon>
          <ListItemText primary={I18n.t('notifications')} />
        </ListItem>
        <Divider />
        <ListItem
          button
          component={Link}
          to="/settings"
          title={I18n.t('settings')}
        >
          <ListItemIcon>
            <SettingsIcon />
          </ListItemIcon>
          <ListItemText primary={I18n.t('settings')} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/invites"
          title={I18n.t('invites')}
        >
          <ListItemIcon>
            <MailIcon />
          </ListItemIcon>
          <ListItemText primary={I18n.t('invites')} />
        </ListItem>
        <Divider />
        <ListItem button onClick={handleFeedbackClick}>
          <ListItemText primary={I18n.t('send feedback')} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/terms"
          title={I18n.t('terms of service')}
        >
          <ListItemText primary={I18n.t('terms of service')} />
        </ListItem>
        <ListItem
          button
          component={Link}
          to="/privacy"
          title={I18n.t('privacy policy')}
        >
          <ListItemText primary={I18n.t('privacy policy')} />
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
