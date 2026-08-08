'use client';

import { Notifications, Search } from '@mui/icons-material';
import {
  AppBar,
  Badge,
  Box,
  IconButton,
  Slide,
  Toolbar,
  useScrollTrigger
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useContext, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import NotificationsContext from '../../context/NotificationsContext';
import ProfileContext from '../../context/ProfileContext';
import ShellContext from '../../context/ShellContext';
import useDictionary from '../../hooks/useDictionary';
import useLocalePath from '../../hooks/useLocalePath';
import ProfileAvatar from '../common/ProfileAvatar';
import Logo from './Logo';
import MobileDrawer from './MobileDrawer';

function MobileAppBarContent() {
  const { openSearch, openCreateMap, appBarHidden } = useContext(ShellContext);
  const { authenticated } = useContext(AuthContext);
  const profile = useContext(ProfileContext);
  const notifications = useContext(NotificationsContext);
  const dictionary = useDictionary();
  const localePath = useLocalePath();

  const unreadCount = notifications.filter(
    (notification) => notification.read === false
  ).length;

  const [drawerOpen, setDrawerOpen] = useState(false);

  const scrollTrigger = useScrollTrigger();

  return (
    <>
      <Slide
        appear={false}
        direction="down"
        in={!appBarHidden && !scrollTrigger}
      >
        <AppBar position="fixed">
          <Toolbar
            sx={{
              display: 'grid',
              gridTemplateColumns: '1fr auto 1fr'
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
              <IconButton
                size="small"
                edge="start"
                onClick={() => setDrawerOpen(true)}
              >
                <ProfileAvatar profile={profile} size={32} />
              </IconButton>
            </Box>

            <Logo color="inherit" />

            <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
              {authenticated && (
                <IconButton
                  component={Link}
                  href={localePath('/notifications')}
                  color="inherit"
                  title={dictionary.notifications}
                  aria-label={dictionary.notifications}
                >
                  <Badge badgeContent={unreadCount} color="secondary">
                    <Notifications />
                  </Badge>
                </IconButton>
              )}

              <IconButton
                onClick={openSearch}
                edge="end"
                color="inherit"
                title={dictionary.search}
                aria-label={dictionary.search}
              >
                <Search />
              </IconButton>
            </Box>
          </Toolbar>
        </AppBar>
      </Slide>

      <MobileDrawer
        open={drawerOpen}
        onOpen={() => setDrawerOpen(true)}
        onClose={() => setDrawerOpen(false)}
        onCreateMapClick={openCreateMap}
      />
    </>
  );
}

export default memo(function MobileAppBar() {
  const pathname = usePathname();

  // MobileAppBar lives in the persistent root layout, so useScrollTrigger keeps
  // its trigger value across client navigations and never recomputes without a
  // scroll event. Remount on path change so the scroll state reflects the new
  // page (scrolled to top) instead of staying hidden.
  return <MobileAppBarContent key={pathname} />;
});
