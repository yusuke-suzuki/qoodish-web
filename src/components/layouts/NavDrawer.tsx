import { AddBox, ChevronLeft } from '@mui/icons-material';
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
import { getAuth } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, Suspense, useContext } from 'react';
import type { Profile } from '../../../types/index.ts';
import AuthContext from '../../context/AuthContext.ts';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import useNavDestinations from '../../hooks/useNavDestinations.ts';
import useProfile from '../../hooks/useProfile.ts';
import { SUPPORT_EMAIL } from '../../utils/brand.ts';
import ProfileAvatar from '../common/ProfileAvatar.tsx';
import LocaleMenuButton from './LocaleMenuButton.tsx';
import Logo from './Logo.tsx';

type Props = {
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  onCreateMapClick: () => void;
};

type ContentProps = Props & {
  profile: Profile | null;
};

function NavDrawerContent({
  open,
  onOpen,
  onClose,
  onCreateMapClick,
  profile
}: ContentProps) {
  const { push } = useRouter();
  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const destinations = useNavDestinations(profile);

  const { authenticated, setSignInRequired, signOut } = useContext(AuthContext);

  const handleSignOutClick = async () => {
    onClose();

    await signOut();

    // Staying put would leave the reader on a page their account was the only
    // way into.
    push(localePath('/'));
  };

  const handleSignInClick = () => {
    onClose();
    setSignInRequired(true);
  };

  const handleCreateMapClick = () => {
    onClose();
    onCreateMapClick();
  };

  return (
    <SwipeableDrawer open={open} onOpen={onOpen} onClose={onClose}>
      <List disablePadding component="nav">
        <Toolbar>
          <IconButton
            onClick={onClose}
            edge="start"
            title={dictionary.close}
            aria-label={dictionary.close}
          >
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

        {destinations.map((destination) => (
          <ListItemButton
            key={destination.key}
            selected={destination.selected}
            disabled={destination.disabled}
            onClick={onClose}
            LinkComponent={destination.href ? Link : 'button'}
            href={destination.href}
            title={destination.label}
          >
            <ListItemIcon>
              <destination.icon />
            </ListItemIcon>
            <ListItemText primary={destination.label} />
          </ListItemButton>
        ))}
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
            onClick={handleSignInClick}
            title={dictionary.login}
          >
            <ListItemText
              primary={dictionary.login}
              slotProps={{
                primary: { color: 'text.secondary' }
              }}
            />
          </ListItemButton>
        )}
        <LocaleMenuButton variant="list" onNavigate={onClose} />
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
        <ListItemButton
          dense
          onClick={onClose}
          href={`mailto:${SUPPORT_EMAIL}`}
          title={dictionary.contact}
        >
          <ListItemText
            primary={dictionary.contact}
            slotProps={{
              primary: { color: 'text.secondary' }
            }}
          />
        </ListItemButton>
      </List>
    </SwipeableDrawer>
  );
}

function NavDrawerWithProfile(props: Props) {
  return <NavDrawerContent {...props} profile={useProfile()} />;
}

export default memo(function NavDrawer(props: Props) {
  return (
    <Suspense fallback={<NavDrawerContent {...props} profile={null} />}>
      <NavDrawerWithProfile {...props} />
    </Suspense>
  );
});
