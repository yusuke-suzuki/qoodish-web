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
import { useRouter } from 'next/router';
import { memo, useCallback, useContext, useRef, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import useDictionary from '../../hooks/useDictionary';
import { useProfile } from '../../hooks/useProfile';
import ProfileAvatar from '../common/ProfileAvatar';

export default memo(function AccountMenuButton() {
  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);
  const dictionary = useDictionary();
  const router = useRouter();

  const buttonRef = useRef<HTMLDivElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  const handleLinkClick = useCallback(() => {
    setAnchorEl(null);
  }, []);

  const handleSignOutClick = useCallback(async () => {
    setAnchorEl(null);

    const auth = getAuth();
    await signOut(auth);

    router.push('/login');
  }, []);

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
        <MenuItem>
          <ListItemAvatar>
            <ProfileAvatar profile={profile} size={30} />
          </ListItemAvatar>

          <ListItemText>
            {profile ? profile.name : dictionary['anonymous user']}
          </ListItemText>
        </MenuItem>

        <Divider />

        {currentUser && [
          <ListItemButton
            LinkComponent={Link}
            key="settings"
            href="/settings"
            title={dictionary.settings}
            onClick={handleLinkClick}
          >
            <ListItemIcon>
              <Settings fontSize="small" />
            </ListItemIcon>
            <ListItemText primary={dictionary.settings} />
          </ListItemButton>
        ]}

        {currentUser ? (
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
            href="/login"
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
          href="/terms"
          title={dictionary['terms of service']}
          onClick={handleLinkClick}
        >
          <ListItemText
            primary={dictionary['terms of service']}
            primaryTypographyProps={{ color: 'text.secondary' }}
          />
        </ListItemButton>

        <ListItemButton
          dense
          LinkComponent={Link}
          href="/privacy"
          title={dictionary['privacy policy']}
          onClick={handleLinkClick}
        >
          <ListItemText
            primary={dictionary['privacy policy']}
            primaryTypographyProps={{ color: 'text.secondary' }}
          />
        </ListItemButton>
      </Menu>
    </>
  );
});
