import { Login, Logout, Settings } from '@mui/icons-material';
import {
  Divider,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem
} from '@mui/material';
import { getAuth, signOut } from 'firebase/auth';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { memo, useContext, useRef, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import ProfileContext from '../../context/ProfileContext';
import useDictionary from '../../hooks/useDictionary';
import useLocalePath from '../../hooks/useLocalePath';
import ProfileAvatar from '../common/ProfileAvatar';

export default memo(function AccountMenuButton() {
  const { authenticated, uid } = useContext(AuthContext);
  const profile = useContext(ProfileContext);
  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const { push } = useRouter();

  const buttonRef = useRef<HTMLDivElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLinkClick = () => {
    setAnchorEl(null);
  };

  const handleSignOutClick = async () => {
    setAnchorEl(null);

    const auth = getAuth();
    await signOut(auth);

    push(localePath('/login'));
  };

  return (
    <>
      <ListItemButton
        ref={buttonRef}
        onClick={() => setAnchorEl(buttonRef.current)}
        sx={{
          justifyContent: 'center'
        }}
      >
        <ListItemAvatar sx={{ minWidth: 0 }}>
          <ProfileAvatar profile={profile} size={30} />
        </ListItemAvatar>
      </ListItemButton>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <ListItemButton
          LinkComponent={profile ? Link : 'button'}
          href={profile ? localePath(`/users/${profile.id}`) : undefined}
          disabled={!profile}
          onClick={handleLinkClick}
        >
          <ListItemAvatar>
            <ProfileAvatar profile={profile} size={30} />
          </ListItemAvatar>

          <ListItemText
            primary={profile ? profile.name : dictionary['anonymous user']}
            secondary={getAuth().currentUser?.email}
          />
        </ListItemButton>

        <Divider />

        {authenticated && [
          <ListItemButton
            LinkComponent={Link}
            key="settings"
            href={localePath('/settings')}
            title={dictionary.settings}
            onClick={handleLinkClick}
          >
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary.settings} />
          </ListItemButton>
        ]}

        {authenticated ? (
          <ListItemButton onClick={handleSignOutClick}>
            <ListItemIcon>
              <Logout fontSize="small" />
            </ListItemIcon>
            <ListItemText>{dictionary.logout}</ListItemText>
          </ListItemButton>
        ) : (
          <ListItemButton
            onClick={handleLinkClick}
            LinkComponent={Link}
            href={localePath('/login')}
            title={dictionary.login}
          >
            <ListItemIcon>
              <Login fontSize="small" />
            </ListItemIcon>
            <ListItemText>{dictionary.login}</ListItemText>
          </ListItemButton>
        )}

        <Divider />

        <ListItemButton
          dense
          LinkComponent={Link}
          href={localePath('/terms')}
          title={dictionary['terms of service']}
          onClick={handleLinkClick}
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
          LinkComponent={Link}
          href={localePath('/privacy')}
          title={dictionary['privacy policy']}
          onClick={handleLinkClick}
        >
          <ListItemText
            primary={dictionary['privacy policy']}
            slotProps={{
              primary: { color: 'text.secondary' }
            }}
          />
        </ListItemButton>
      </Menu>
    </>
  );
});
