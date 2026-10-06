'use client';

import { AddBox, DirectionsWalk, Explore, Home } from '@mui/icons-material';
import {
  BottomNavigation,
  BottomNavigationAction,
  Box,
  Paper
} from '@mui/material';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { memo, Suspense, useContext } from 'react';
import type { Profile } from '../../../types/index.ts';
import AuthContext from '../../context/AuthContext.ts';
import ShellContext from '../../context/ShellContext.tsx';
import useDictionary from '../../hooks/useDictionary.ts';
import useLocalePath from '../../hooks/useLocalePath.ts';
import useProfile from '../../hooks/useProfile.ts';
import ProfileAvatar from '../common/ProfileAvatar.tsx';

type ContentProps = {
  profile: Profile | null;
};

function selectedTab(pathname: string): number | undefined {
  if (/^\/[a-z]+\/?$/.test(pathname)) {
    return 0;
  }

  if (pathname.endsWith('/discover')) {
    return 1;
  }

  if (pathname.endsWith('/journeys')) {
    return 3;
  }

  if (pathname.includes('/users/')) {
    return 4;
  }

  return undefined;
}

function BottomNavContent({ profile }: ContentProps) {
  const { authenticated } = useContext(AuthContext);
  const { openCreateMap } = useContext(ShellContext);

  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const pathname = usePathname();

  const bottomNavValue = selectedTab(pathname);

  if (!authenticated) return null;
  if (pathname.includes('/chapters/') || pathname.includes('/maps/')) {
    return null;
  }

  return (
    <Box sx={{ display: { xs: 'block', md: 'none' } }}>
      <Box sx={{ height: 56 }} />

      <Box
        sx={{
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
              aria-label={dictionary.home}
              title={dictionary.home}
              icon={<Home />}
              LinkComponent={Link}
              href={localePath('/')}
            />
            <BottomNavigationAction
              aria-label={dictionary.discover}
              title={dictionary.discover}
              icon={<Explore />}
              LinkComponent={Link}
              href={localePath('/discover')}
            />
            <BottomNavigationAction
              aria-label={dictionary['create new map']}
              title={dictionary['create new map']}
              icon={<AddBox color="secondary" />}
              onClick={openCreateMap}
            />
            <BottomNavigationAction
              aria-label={dictionary['journey log']}
              title={dictionary['journey log']}
              icon={<DirectionsWalk />}
              LinkComponent={Link}
              href={localePath('/journeys')}
            />
            <BottomNavigationAction
              aria-label={dictionary.profile}
              title={dictionary.profile}
              icon={
                <Box
                  sx={{
                    display: 'flex',
                    borderRadius: '50%',
                    border: 2,
                    borderColor:
                      bottomNavValue === 4 ? 'primary.main' : 'transparent'
                  }}
                >
                  <ProfileAvatar profile={profile} size={22} />
                </Box>
              }
              {...(profile && {
                LinkComponent: Link,
                href: localePath(`/users/${profile.id}`)
              })}
              disabled={!profile}
            />
          </BottomNavigation>
        </Paper>
      </Box>
    </Box>
  );
}

function BottomNavWithProfile() {
  return <BottomNavContent profile={useProfile()} />;
}

export default memo(function BottomNav() {
  return (
    <Suspense fallback={<BottomNavContent profile={null} />}>
      <BottomNavWithProfile />
    </Suspense>
  );
});
