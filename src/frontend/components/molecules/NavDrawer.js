import React, { useCallback } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import { unstable_useMediaQuery as useMediaQuery } from '@material-ui/core/useMediaQuery';

import SwipeableDrawer from '@material-ui/core/SwipeableDrawer';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import ListItemSecondaryAction from '@material-ui/core/ListItemSecondaryAction';
import IconButton from '@material-ui/core/IconButton';
import Divider from '@material-ui/core/Divider';
import Button from '@material-ui/core/Button';

import HomeIcon from '@material-ui/icons/Home';
import ExploreIcon from '@material-ui/icons/Explore';
import AccountCircleIcon from '@material-ui/icons/AccountCircle';
import SettingsIcon from '@material-ui/icons/Settings';
import MailIcon from '@material-ui/icons/Mail';
import NotificationsIcon from '@material-ui/icons/Notifications';
import ExitToAppIcon from '@material-ui/icons/ExitToApp';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';

import Link from './Link';
import I18n from '../../utils/I18n';

import openFeedbackDialog from '../../actions/openFeedbackDialog';
import openDrawer from '../../actions/openDrawer';
import closeDrawer from '../../actions/closeDrawer';

import getFirebase from '../../utils/getFirebase';
import getFirebaseAuth from '../../utils/getFirebaseAuth';
import signIn from '../../actions/signIn';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import ProfileCard from './ProfileCard';
import deleteRegistrationToken from '../../utils/deleteRegistrationToken';
import Logo from './Logo';
import openAnnouncementDialog from '../../actions/openAnnouncementDialog';

const styles = {
  titleLarge: {
    height: 64
  },
  titleSmall: {
    height: 56
  },
  drawerPaper: {
    width: 280
  }
};

const Title = React.memo(() => {
  const large = useMediaQuery('(min-width: 600px)');
  const dispatch = useDispatch();

  const handleCloseDrawer = useCallback(() => {
    dispatch(closeDrawer());
  });

  return (
    <ListItem
      divider
      component={Link}
      to="/"
      style={large ? styles.titleLarge : styles.titleSmall}
    >
      <ListItemText disableTypography primary={<Logo />} />
      <ListItemSecondaryAction>
        <IconButton onClick={handleCloseDrawer}>
          <ChevronLeftIcon />
        </IconButton>
      </ListItemSecondaryAction>
    </ListItem>
  );
});

const DrawerContents = React.memo(() => {
  const mapState = useCallback(
    state => ({
      currentLocation: state.shared.currentLocation,
      currentUser: state.app.currentUser,
      history: state.shared.history,
      announcementIsNew: state.shared.announcementIsNew
    }),
    []
  );
  const {
    currentLocation,
    currentUser,
    history,
    announcementIsNew
  } = useMappedState(mapState);
  const dispatch = useDispatch();

  const handleSignOutClick = useCallback(async () => {
    dispatch(requestStart());

    deleteRegistrationToken();

    const firebase = await getFirebase();
    await getFirebaseAuth();

    await firebase.auth().signOut();
    await firebase.auth().signInAnonymously();

    const currentUser = firebase.auth().currentUser;
    const user = {
      uid: currentUser.uid,
      isAnonymous: true
    };
    dispatch(signIn(user));

    history.push('/login');
    dispatch(requestFinish());
  });

  const handleAnnouncementClick = useCallback(() => {
    dispatch(openAnnouncementDialog());
  });

  const handleFeedbackClick = useCallback(() => {
    dispatch(openFeedbackDialog());
  });

  const isSelected = useCallback(pathname => {
    return currentLocation && currentLocation.pathname === pathname;
  });

  return (
    <div>
      <List disablePadding component="nav">
        <Title />
        <ProfileCard />
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
        {currentUser.isAnonymous ? (
          <ListItem button component={Link} to="/login" title={I18n.t('login')}>
            <ListItemIcon>
              <ExitToAppIcon />
            </ListItemIcon>
            <ListItemText
              primary={I18n.t('login')}
              primaryTypographyProps={{ color: 'textSecondary' }}
            />
          </ListItem>
        ) : (
          <ListItem button onClick={handleSignOutClick}>
            <ListItemText
              primary={I18n.t('logout')}
              primaryTypographyProps={{ color: 'textSecondary' }}
            />
          </ListItem>
        )}
        <ListItem button onClick={handleAnnouncementClick}>
          <ListItemText
            primary={I18n.t('announcement')}
            primaryTypographyProps={{ color: 'textSecondary' }}
          />
          {announcementIsNew && (
            <ListItemSecondaryAction onClick={handleAnnouncementClick}>
              <Button color="primary">NEW</Button>
            </ListItemSecondaryAction>
          )}
        </ListItem>
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
});

const NavDrawer = () => {
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
      PaperProps={{ style: styles.drawerPaper }}
    >
      <DrawerContents />
    </SwipeableDrawer>
  );
};

export default React.memo(NavDrawer);
