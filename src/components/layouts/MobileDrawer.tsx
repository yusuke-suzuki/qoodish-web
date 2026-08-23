import {
  AccountCircle,
  AddBox,
  Bookmarks,
  ChevronLeft,
  DirectionsWalk,
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
import { usePathname, useRouter } from 'next/navigation';
import { memo, useContext } from 'react';
import AuthContext from '../../context/AuthContext';
import ProfileContext from '../../context/ProfileContext';
import useDictionary from '../../hooks/useDictionary';
import useLocalePath from '../../hooks/useLocalePath';
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
  const { push } = useRouter();
  const pathname = usePathname();
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  const { authenticated } = useContext(AuthContext);
  const profile = useContext(ProfileContext);

  const handleSignOutClick = async () => {
    onClose();

    const auth = getAuth();
    await signOut(auth);

    push(localePath('/login'));
  };

  const handleCreateMapClick = () => {
    onClose();
    onCreateMapClick();
  };

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
                  {getAuth().currentUser?.email}
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
          selected={/^\/[a-z]+\/?$/.test(pathname)}
          onClick={onClose}
          LinkComponent={Link}
          href={localePath('/')}
          title={dictionary.home}
        >
          <ListItemIcon>
            <Home />
          </ListItemIcon>
          <ListItemText primary={dictionary.home} />
        </ListItemButton>
        <ListItemButton
          selected={pathname.endsWith('/discover')}
          onClick={onClose}
          LinkComponent={Link}
          href={localePath('/discover')}
          title={dictionary.discover}
        >
          <ListItemIcon>
            <Explore />
          </ListItemIcon>
          <ListItemText primary={dictionary.discover} />
        </ListItemButton>

        {authenticated && (
          <>
            <ListItemButton
              selected={pathname.endsWith('/journeys')}
              onClick={onClose}
              LinkComponent={Link}
              href={localePath('/journeys')}
              title={dictionary['journey log']}
            >
              <ListItemIcon>
                <DirectionsWalk />
              </ListItemIcon>
              <ListItemText primary={dictionary['journey log']} />
            </ListItemButton>
            <ListItemButton
              selected={pathname.includes('/users/')}
              onClick={onClose}
              LinkComponent={profile ? Link : 'button'}
              href={profile ? localePath(`/users/${profile.id}`) : undefined}
              disabled={!profile}
              title={dictionary.profile}
            >
              <ListItemIcon>
                <AccountCircle />
              </ListItemIcon>
              <ListItemText primary={dictionary.profile} />
            </ListItemButton>
            <ListItemButton
              selected={pathname.endsWith('/bookmarks')}
              onClick={onClose}
              LinkComponent={Link}
              href={localePath('/bookmarks')}
              title={dictionary.bookmarks}
            >
              <ListItemIcon>
                <Bookmarks />
              </ListItemIcon>
              <ListItemText primary={dictionary.bookmarks} />
            </ListItemButton>
            <ListItemButton
              selected={pathname.endsWith('/notifications')}
              onClick={onClose}
              LinkComponent={Link}
              href={localePath('/notifications')}
              title={dictionary.notifications}
            >
              <ListItemIcon>
                <NotificationsNone />
              </ListItemIcon>
              <ListItemText primary={dictionary.notifications} />
            </ListItemButton>
            <ListItemButton
              selected={pathname.endsWith('/coauthorship_invitations')}
              onClick={onClose}
              LinkComponent={Link}
              href={localePath('/coauthorship_invitations')}
              title={dictionary.invites}
            >
              <ListItemIcon>
                <Mail />
              </ListItemIcon>
              <ListItemText primary={dictionary.invites} />
            </ListItemButton>
            <ListItemButton
              selected={pathname.endsWith('/settings')}
              onClick={onClose}
              LinkComponent={Link}
              href={localePath('/settings')}
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
        {authenticated ? (
          <ListItemButton dense onClick={handleSignOutClick}>
            <ListItemText
              primary={dictionary.logout}
              slotProps={{
                primary: { color: 'text.secondary' }
              }}
            />
          </ListItemButton>
        ) : (
          <ListItemButton
            dense
            onClick={onClose}
            LinkComponent={Link}
            href={localePath('/login')}
            title={dictionary.login}
          >
            <ListItemIcon>
              <ExitToApp />
            </ListItemIcon>
            <ListItemText
              primary={dictionary.login}
              slotProps={{
                primary: { color: 'text.secondary' }
              }}
            />
          </ListItemButton>
        )}
        <ListItemButton
          dense
          onClick={onClose}
          LinkComponent={Link}
          href={localePath('/terms')}
          title={dictionary['terms of service']}
        >
          <ListItemText
            primary={dictionary['terms of service']}
            slotProps={{
              primary: { color: 'text.secondary' }
            }}
          />
        </ListItemButton>
        <ListItemButton
          dense
          onClick={onClose}
          LinkComponent={Link}
          href={localePath('/privacy')}
          title={dictionary['privacy policy']}
        >
          <ListItemText
            primary={dictionary['privacy policy']}
            slotProps={{
              primary: { color: 'text.secondary' }
            }}
          />
        </ListItemButton>
      </List>
    </SwipeableDrawer>
  );
});
