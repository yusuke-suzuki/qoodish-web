'use client';

import {
  AccountCircle,
  AddBox,
  Explore,
  Home,
  Notifications
} from '@mui/icons-material';
import {
  Badge,
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useContext, useEffect, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import ShellContext from '../../context/ShellContext';
import useDictionary from '../../hooks/useDictionary';
import { useNotifications } from '../../hooks/useNotifications';
import { useProfile } from '../../hooks/useProfile';

export default memo(function BottomNav() {
  const { currentUser } = useContext(AuthContext);
  const { openCreateMap } = useContext(ShellContext);

  const { profile } = useProfile(currentUser?.uid);
  const { notifications } = useNotifications();

  const unreadNotifications = notifications.filter((notification) => {
    return notification.read === false;
  });

  const [bottomNavValue, setBottomNavValue] = useState<number | undefined>(
    undefined
  );

  const dictionary = useDictionary();
  const pathname = usePathname();

  useEffect(() => {
    if (/^\/[a-z]+\/?$/.test(pathname)) {
      setBottomNavValue(0);
    } else if (pathname.endsWith('/discover')) {
      setBottomNavValue(1);
    } else if (pathname.endsWith('/notifications')) {
      setBottomNavValue(3);
    } else if (pathname.includes('/users/')) {
      setBottomNavValue(4);
    } else {
      setBottomNavValue(0);
    }
  }, [pathname]);

  if (!currentUser) return null;

  return (
    <Box
      sx={{
        display: { xs: 'block', md: 'none' },
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 1
      }}
    >
      <Paper>
        <BottomNavigation value={bottomNavValue}>
          <BottomNavigationAction
            title={dictionary.home}
            icon={<Home />}
            LinkComponent={Link}
            href="/"
          />
          <BottomNavigationAction
            title={dictionary.discover}
            icon={<Explore />}
            LinkComponent={Link}
            href="/discover"
          />
          <BottomNavigationAction
            title={dictionary['create new map']}
            icon={<AddBox color="secondary" />}
            onClick={openCreateMap}
          />
          <BottomNavigationAction
            title={dictionary.notice}
            icon={
              <Badge
                badgeContent={unreadNotifications.length}
                color="secondary"
              >
                <Notifications />
              </Badge>
            }
            LinkComponent={Link}
            href="/notifications"
          />
          <BottomNavigationAction
            title={dictionary.account}
            icon={<AccountCircle />}
            LinkComponent={Link}
            href={`/users/${profile?.id}`}
          />
        </BottomNavigation>
      </Paper>
    </Box>
  );
});
