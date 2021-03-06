import React, { memo, useCallback, useContext, useMemo } from 'react';
import { useDispatch, useMappedState } from 'redux-react-hook';
import useMediaQuery from '@material-ui/core/useMediaQuery';
import { useHistory, Link } from '@yusuke-suzuki/rize-router';

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

import I18n from '../../utils/I18n';

import openFeedbackDialog from '../../actions/openFeedbackDialog';

import getFirebase from '../../utils/getFirebase';
import getFirebaseAuth from '../../utils/getFirebaseAuth';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import ProfileCard from './ProfileCard';
import deleteRegistrationToken from '../../utils/deleteRegistrationToken';
import Logo from './Logo';
import openAnnouncementDialog from '../../actions/openAnnouncementDialog';
import { useIOS } from '../../utils/detectDevice';
import AuthContext from '../../context/AuthContext';
import { makeStyles, createStyles, useTheme } from '@material-ui/core';
import DrawerContext from '../../context/DrawerContext';

const useStyles = makeStyles(() =>
  createStyles({
    titleLarge: {
      height: 64
    },
    titleSmall: {
      height: 56
    },
    drawerPaper: {
      width: 280
    }
  })
);

const Title = memo(() => {
  const theme = useTheme();
  const smUp = useMediaQuery(theme.breakpoints.up('sm'));
  const { setDrawerOpen } = useContext(DrawerContext);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const classes = useStyles();

  return (
    <ListItem
      divider
      component={Link}
      to="/"
      className={smUp ? classes.titleLarge : classes.titleSmall}
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

const DrawerContents = memo(() => {
  const mapState = useCallback(
    state => ({
      currentLocation: state.shared.currentLocation,
      announcementIsNew: state.shared.announcementIsNew
    }),
    []
  );
  const { currentLocation, announcementIsNew } = useMappedState(mapState);

  const { currentUser } = useContext(AuthContext);

  const dispatch = useDispatch();
  const history = useHistory();

  const handleSignOutClick = useCallback(async () => {
    dispatch(requestStart());

    deleteRegistrationToken();

    const firebase = await getFirebase();
    await getFirebaseAuth();

    await firebase.auth().signOut();
    history.push('/login');

    dispatch(requestFinish());
  }, [dispatch, history]);

  const handleAnnouncementClick = useCallback(() => {
    dispatch(openAnnouncementDialog());
  }, [dispatch]);

  const handleFeedbackClick = useCallback(() => {
    dispatch(openFeedbackDialog());
  }, [dispatch]);

  const isSelected = useCallback(
    pathname => {
      return currentLocation && currentLocation.pathname === pathname;
    },
    [currentLocation]
  );

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

export default memo(function NavDrawer() {
  const { drawerOpen, setDrawerOpen } = useContext(DrawerContext);

  const handleOpenDrawer = useCallback(() => {
    setDrawerOpen(true);
  }, []);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const iOS = useMemo(() => {
    return useIOS();
  }, [useIOS]);

  const classes = useStyles();

  return (
    <SwipeableDrawer
      open={drawerOpen}
      onOpen={handleOpenDrawer}
      onClose={handleCloseDrawer}
      onClick={handleCloseDrawer}
      PaperProps={{ className: classes.drawerPaper }}
      disableBackdropTransition={!iOS}
      disableDiscovery={iOS}
    >
      <DrawerContents />
    </SwipeableDrawer>
  );
});
