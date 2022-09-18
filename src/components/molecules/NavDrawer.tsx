import { memo, useCallback, useContext } from 'react';
import { useDispatch } from 'redux-react-hook';
import Link from 'next/link';
import { useRouter } from 'next/router';
import requestStart from '../../actions/requestStart';
import requestFinish from '../../actions/requestFinish';
import ProfileCard from './ProfileCard';
import Logo from './Logo';
import AuthContext from '../../context/AuthContext';
import DrawerContext from '../../context/DrawerContext';
import {
  makeStyles,
  ListItem,
  ListItemText,
  IconButton,
  List,
  ListItemIcon,
  Divider,
  SwipeableDrawer,
  Toolbar
} from '@material-ui/core';
import {
  AccountCircle,
  ChevronLeft,
  ExitToApp,
  Explore,
  Home,
  Mail,
  Notifications,
  Settings
} from '@material-ui/icons';
import { getAuth, signOut } from '@firebase/auth';
import { useLocale } from '../../hooks/useLocale';

const useStyles = makeStyles(theme => ({
  closeButton: {
    marginRight: theme.spacing(1)
  },
  drawerPaper: {
    width: 280
  }
}));

const Title = memo(() => {
  const { setDrawerOpen } = useContext(DrawerContext);

  const handleCloseDrawer = useCallback(() => {
    setDrawerOpen(false);
  }, []);

  const classes = useStyles();

  return (
    <Toolbar>
      <IconButton
        onClick={handleCloseDrawer}
        edge="start"
        className={classes.closeButton}
      >
        <ChevronLeft />
      </IconButton>
      <Link href="/" passHref>
        <Logo />
      </Link>
    </Toolbar>
  );
});

const DrawerContents = memo(() => {
  const { currentUser } = useContext(AuthContext);

  const dispatch = useDispatch();
  const router = useRouter();
  const { I18n } = useLocale();

  const handleSignOutClick = useCallback(async () => {
    dispatch(requestStart());

    const auth = getAuth();
    await signOut(auth);

    router.push('/login');

    dispatch(requestFinish());
  }, [dispatch, router, getAuth, signOut]);

  const isSelected = useCallback(
    pathname => {
      return router.pathname === pathname;
    },
    [router]
  );

  return (
    <div>
      <List disablePadding component="nav">
        <Title />
        <ProfileCard />
        <Link href="/" passHref>
          <ListItem button title={I18n.t('home')}>
            <ListItemIcon>
              <Home color={isSelected('/') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary={I18n.t('home')}
              primaryTypographyProps={
                isSelected('/') ? { color: 'primary' } : {}
              }
            />
          </ListItem>
        </Link>
        <Link href="/discover" passHref>
          <ListItem button title={I18n.t('discover')}>
            <ListItemIcon>
              <Explore
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
        </Link>
        <Link href="/profile" passHref>
          <ListItem button title={I18n.t('account')}>
            <ListItemIcon>
              <AccountCircle
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
        </Link>
        <Link href="/notifications" passHref>
          <ListItem button title={I18n.t('notifications')}>
            <ListItemIcon>
              <Notifications
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
        </Link>
        <Link href="/settings" passHref>
          <ListItem button title={I18n.t('settings')}>
            <ListItemIcon>
              <Settings
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
        </Link>
        <Link href="/invites" passHref>
          <ListItem button title={I18n.t('invites')}>
            <ListItemIcon>
              <Mail color={isSelected('/invites') ? 'primary' : 'inherit'} />
            </ListItemIcon>
            <ListItemText
              primary={I18n.t('invites')}
              primaryTypographyProps={
                isSelected('/invites') ? { color: 'primary' } : {}
              }
            />
          </ListItem>
        </Link>
        <Divider />
        {currentUser.isAnonymous ? (
          <Link href="/login" passHref>
            <ListItem button title={I18n.t('login')}>
              <ListItemIcon>
                <ExitToApp />
              </ListItemIcon>
              <ListItemText
                primary={I18n.t('login')}
                primaryTypographyProps={{ color: 'textSecondary' }}
              />
            </ListItem>
          </Link>
        ) : (
          <ListItem button onClick={handleSignOutClick}>
            <ListItemText
              primary={I18n.t('logout')}
              primaryTypographyProps={{ color: 'textSecondary' }}
            />
          </ListItem>
        )}
        <Link href="/terms" passHref>
          <ListItem button title={I18n.t('terms of service')}>
            <ListItemText
              primary={I18n.t('terms of service')}
              primaryTypographyProps={{ color: 'textSecondary' }}
            />
          </ListItem>
        </Link>
        <Link href="/privacy" passHref>
          <ListItem button title={I18n.t('privacy policy')}>
            <ListItemText
              primary={I18n.t('privacy policy')}
              primaryTypographyProps={{ color: 'textSecondary' }}
            />
          </ListItem>
        </Link>
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

  const classes = useStyles();

  return (
    <SwipeableDrawer
      open={drawerOpen}
      onOpen={handleOpenDrawer}
      onClose={handleCloseDrawer}
      onClick={handleCloseDrawer}
      PaperProps={{ className: classes.drawerPaper }}
    >
      <DrawerContents />
    </SwipeableDrawer>
  );
});
