import {
  AccountCircle,
  AddBox,
  ChevronLeft,
  ExitToApp,
  Explore,
  Home,
  Mail,
  NotificationsNone,
  Settings
} from '@mui/icons-material';
import {
  Box,
  Divider,
  Fab,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Stack,
  SwipeableDrawer,
  Toolbar,
  Typography
} from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { memo, useCallback, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import { useProfile } from '../../hooks/useProfile';
import ProfileAvatar from '../common/ProfileAvatar';
import Logo from './Logo';

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCreateMapClick: () => void;
};

export default memo(function MobileDrawer({
  open,
  onOpen,
  onClose,
  onCreateMapClick
}: Props) {
  const { push, pathname } = useRouter();
  const dictionary = useDictionary();

  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);

  const handleSignOutClick = useCallback(async () => {
    onClose();

    const auth = getAuth();
    await signOut(auth);

    push('/login');
  }, [onClose, push]);

  const handleCreateMapClick = useCallback(() => {
    onClose();
    onCreateMapClick();
  }, [onClose, onCreateMapClick]);

  return (
    <SwipeableDrawer open={open} onOpen={onOpen} onClose={onClose}>
      <List disablePadding component="nav">
        <Toolbar>
          <IconButton onClick={onClose} edge="start">
            <ChevronLeft />
          </IconButton>

          <Logo />
        </Toolbar>

        <Box sx={{ p: 2 }}>
          <Stack gap={1}>
            <ProfileAvatar size={48} profile={profile} />

            {profile ? (
              <Box>
                <Typography variant="subtitle1" fontWeight={600}>
                  {profile.name}
                </Typography>

                <Typography variant="subtitle2" color="text.secondary">
                  {currentUser?.email}
                </Typography>
              </Box>
            ) : (
              <Typography variant="subtitle1">
                {dictionary['anonymous user']}
              </Typography>
            )}
          </Stack>
        </Box>

        <ListItemButton
          selected={pathname === '/'}
          onClick={onClose}
          LinkComponent={Link}
          href="/"
          title={dictionary.home}
        >
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary={dictionary.home} />
        </ListItemButton>
        <ListItemButton
          selected={pathname === '/discover'}
          onClick={onClose}
          LinkComponent={Link}
          href="/discover"
          title={dictionary.discover}
        >
          <ListItemIcon>
            <Explore />
          </ListItemIcon>
          <ListItemText primary={dictionary.discover} />
        </ListItemButton>

        {currentUser && (
          <>
            <ListItemButton
              selected={pathname === '/users/[userId]'}
              onClick={onClose}
              LinkComponent={Link}
              href={`/users/${profile?.id}`}
              title={dictionary.account}
            >
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary={dictionary.account} />
            </ListItemButton>
            <ListItemButton
              selected={pathname === '/notifications'}
              onClick={onClose}
              LinkComponent={Link}
              href="/notifications"
              title={dictionary.notifications}
            >
              <ListItemIcon>
                <NotificationsNone />
              </ListItemIcon>
              <ListItemText primary={dictionary.notifications} />
            </ListItemButton>
            <ListItemButton
              selected={pathname === '/settings'}
              onClick={onClose}
              LinkComponent={Link}
              href="/settings"
              title={dictionary.settings}
            >
              <ListItemIcon>
                <Settings />
              </ListItemIcon>
              <ListItemText primary={dictionary.settings} />
            </ListItemButton>
          </>
        )}
      </List>

      <Divider />

      <Box sx={{ p: 2 }}>
        <Fab
          onClick={handleCreateMapClick}
          color="secondary"
          variant="extended"
        >
          <AddBox sx={{ mr: 1 }} />
          {dictionary['create new map']}
        </Fab>
      </Box>

      <List disablePadding component="nav">
        {currentUser ? (
          <ListItemButton dense onClick={handleSignOutClick}>
            <ListItemText
              primary={dictionary.logout}
              primaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItemButton>
        ) : (
          <ListItemButton
            dense
            onClick={onClose}
            LinkComponent={Link}
            href="/login"
            title={dictionary.login}
          >
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText
              primary={dictionary.login}
              primaryTypographyProps={{ color: 'text.secondary' }}
            />
          </ListItemButton>
        )}
        <ListItemButton
          dense
          onClick={onClose}
          LinkComponent={Link}
          href="/terms"
          title={dictionary['terms of service']}
        >
          <ListItemText
            primary={dictionary['terms of service']}
            primaryTypographyProps={{ color: 'text.secondary' }}
          />
        </ListItemButton>
        <ListItemButton
          dense
          onClick={onClose}
          LinkComponent={Link}
          href="/privacy"
          title={dictionary['privacy policy']}
        >
          <ListItemText
            primary={dictionary['privacy policy']}
            primaryTypographyProps={{ color: 'text.secondary' }}
          />
        </ListItemButton>
      </List>
    </SwipeableDrawer>
  );
});
