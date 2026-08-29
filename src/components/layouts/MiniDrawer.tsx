'use client';

import {
  AccountCircle,
  AccountCircleOutlined,
  AddBox,
  BookmarkBorder,
  Bookmarks,
  DirectionsWalk,
  DirectionsWalkOutlined,
  Explore,
  ExploreOutlined,
  Home,
  HomeOutlined,
  Mail,
  MailOutline,
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
import { usePathname, useRouter } from 'next/navigation';
import { memo, useContext, useRef, useState } from 'react';
import AuthContext from '../../context/AuthContext.ts';
import NotificationsContext from '../../context/NotificationsContext.ts';
import ProfileContext from '../../context/ProfileContext.ts';
import ShellContext from '../../context/ShellContext.tsx';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import NotificationList from '../notifications/NotificationList.tsx';
import AccountMenuButton from './AccountMenuButton.tsx';
import LocaleMenuButton from './LocaleMenuButton.tsx';
import LogoAvatar from './LogoAvatar.tsx';

export default memo(function MiniDrawer() {
  const { openSearch, openCreateMap } = useContext(ShellContext);
  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const pathname = usePathname();
  const router = useRouter();
  const { authenticated } = useContext(AuthContext);
  const profile = useContext(ProfileContext);
  const notifications = useContext(NotificationsContext);

  const refreshNotifications = () => {
    router.refresh();
  };

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
            href={localePath('/')}
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
            href={localePath('/')}
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
            href={localePath('/discover')}
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

          {authenticated && (
            <ListItemButton
              selected={pathname.endsWith('/journeys')}
              LinkComponent={Link}
              href={localePath('/journeys')}
              title={dictionary['journey log']}
              sx={{
                justifyContent: 'center'
              }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                {pathname.endsWith('/journeys') ? (
                  <DirectionsWalk sx={{ color: 'primary.contrastText' }} />
                ) : (
                  <DirectionsWalkOutlined
                    sx={{ color: 'primary.contrastText' }}
                  />
                )}
              </ListItemIcon>
            </ListItemButton>
          )}

          {authenticated && (
            <ListItemButton
              selected={pathname.endsWith(`/users/${profile?.id}`)}
              LinkComponent={profile ? Link : 'button'}
              href={profile ? localePath(`/users/${profile.id}`) : undefined}
              disabled={!profile}
              title={dictionary.profile}
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

          {authenticated && (
            <ListItemButton
              selected={pathname.endsWith('/bookmarks')}
              LinkComponent={Link}
              href={localePath('/bookmarks')}
              title={dictionary.bookmarks}
              sx={{
                justifyContent: 'center'
              }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                {pathname.endsWith('/bookmarks') ? (
                  <Bookmarks sx={{ color: 'primary.contrastText' }} />
                ) : (
                  <BookmarkBorder sx={{ color: 'primary.contrastText' }} />
                )}
              </ListItemIcon>
            </ListItemButton>
          )}

          {authenticated && (
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

          {authenticated && (
            <ListItemButton
              selected={pathname.endsWith('/coauthorship_invitations')}
              LinkComponent={Link}
              href={localePath('/coauthorship_invitations')}
              title={dictionary.invites}
              sx={{
                justifyContent: 'center'
              }}
            >
              <ListItemIcon sx={{ minWidth: 0 }}>
                {pathname.endsWith('/coauthorship_invitations') ? (
                  <Mail sx={{ color: 'primary.contrastText' }} />
                ) : (
                  <MailOutline sx={{ color: 'primary.contrastText' }} />
                )}
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
          <LocaleMenuButton variant="rail" />

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
          onReadNotifications={refreshNotifications}
          onNotificationClick={() => setAnchorEl(null)}
        />
      </Menu>
    </>
  );
});
