'use client';

import {
  AccountCircle,
  AccountCircleOutlined,
  AddBox,
  Explore,
  ExploreOutlined,
  Home,
  HomeOutlined,
  Notifications,
  NotificationsOutlined,
  SearchOutlined
} from '@mui/icons-material';
import {
  Badge,
  Drawer,
  List,
  ListItemAvatar,
  ListItemButton,
  ListItemIcon,
  Menu
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, useContext, useRef, useState } from 'react';
import AuthContext from '../../context/AuthContext';
import ShellContext from '../../context/ShellContext';
import useDictionary from '../../hooks/useDictionary';
import { useNotifications } from '../../hooks/useNotifications';
import { useProfile } from '../../hooks/useProfile';
import NotificationList from '../notifications/NotificationList';
import AccountMenuButton from './AccountMenuButton';
import LogoAvatar from './LogoAvatar';

export default memo(function MiniDrawer() {
  const { openSearch, openCreateMap } = useContext(ShellContext);
  const dictionary = useDictionary();
  const pathname = usePathname();
  const { currentUser } = useContext(AuthContext);
  const { profile } = useProfile(currentUser?.uid);
  const { notifications, mutate } = useNotifications();

  const unreadNotifications = notifications.filter((notification) => {
    return notification.read === false;
  });

  const buttonRef = useRef<HTMLDivElement | null>(null);

  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);

  return (
    <>
      <Drawer
        variant="permanent"
        open={true}
        slotProps={{
          paper: {
            sx: {
              display: 'flex',
              justifyContent: 'space-between',
              flexDirection: 'column',
              backgroundColor: 'primary.main'
            }
          }
        }}
      >
        <List>
          <ListItemButton
            LinkComponent={Link}
            title="Qoodish"
            href="/"
            sx={{
              justifyContent: 'center'
            }}
          >
            <ListItemAvatar sx={{ minWidth: 0 }}>
              <LogoAvatar />
            </ListItemAvatar>
          </ListItemButton>
        </List>

        <List component="nav">
          <ListItemButton
            selected={/^\/[a-z]+\/?$/.test(pathname)}
            LinkComponent={Link}
            title={dictionary.home}
            href="/"
            sx={{
              justifyContent: 'center'
            }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              {/^\/[a-z]+\/?$/.test(pathname) ? (
                <Home sx={{ color: 'primary.contrastText' }} />
              ) : (
                <HomeOutlined sx={{ color: 'primary.contrastText' }} />
              )}
            </ListItemIcon>
          </ListItemButton>

          <ListItemButton
            selected={pathname.endsWith('/discover')}
            LinkComponent={Link}
            title={dictionary.discover}
            href="/discover"
            sx={{
              justifyContent: 'center'
            }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              {pathname.endsWith('/discover') ? (
                <Explore sx={{ color: 'primary.contrastText' }} />
              ) : (
                <ExploreOutlined sx={{ color: 'primary.contrastText' }} />
              )}
            </ListItemIcon>
          </ListItemButton>

          {currentUser && (
            <ListItemButton
              selected={pathname.endsWith(`/users/${profile?.id}`)}
              LinkComponent={Link}
              href={`/users/${profile?.id}`}
              title={dictionary.account}
              sx={{
                justifyContent: 'center'
              }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                {pathname.endsWith(`/users/${profile?.id}`) ? (
                  <AccountCircle sx={{ color: 'primary.contrastText' }} />
                ) : (
                  <AccountCircleOutlined
                    sx={{ color: 'primary.contrastText' }}
                  />
                )}
              </ListItemIcon>
            </ListItemButton>
          )}

          {currentUser && (
            <ListItemButton
              title={dictionary.notifications}
              ref={buttonRef}
              onClick={() => setAnchorEl(buttonRef.current)}
              sx={{
                justifyContent: 'center'
              }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                <Badge
                  badgeContent={unreadNotifications.length}
                  color="secondary"
                >
                  {anchorEl ? (
                    <Notifications sx={{ color: 'primary.contrastText' }} />
                  ) : (
                    <NotificationsOutlined
                      sx={{ color: 'primary.contrastText' }}
                    />
                  )}
                </Badge>
              </ListItemIcon>
            </ListItemButton>
          )}

          <ListItemButton
            title={dictionary.search}
            onClick={openSearch}
            sx={{
              justifyContent: 'center'
            }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              <SearchOutlined sx={{ color: 'primary.contrastText' }} />
            </ListItemIcon>
          </ListItemButton>

          <ListItemButton
            title={dictionary['create new map']}
            onClick={openCreateMap}
            sx={{
              justifyContent: 'center'
            }}
          >
            <ListItemIcon sx={{ minWidth: 0 }}>
              <AddBox color="secondary" />
            </ListItemIcon>
          </ListItemButton>
        </List>

        <List component="nav">
          <AccountMenuButton />
        </List>
      </Drawer>
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={() => setAnchorEl(null)}
      >
        <NotificationList
          notifications={notifications}
          onReadNotifications={mutate}
          onNotificationClick={() => setAnchorEl(null)}
        />
      </Menu>
    </>
  );
});
