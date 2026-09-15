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
import { memo, Suspense, useContext, useEffect, useState } from 'react';
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

function BottomNavContent({ profile }: ContentProps) {
  const { authenticated } = useContext(AuthContext);
  const { openCreateMap } = useContext(ShellContext);

  const [bottomNavValue, setBottomNavValue] = useState<number | undefined>(
    undefined
  );

  const dictionary = useDictionary();
  const localePath = useLocalePath();
  const pathname = usePathname();

  useEffect(() => {
    if (/^\/[a-z]+\/?$/.test(pathname)) {
      setBottomNavValue(0);
    } else if (pathname.endsWith('/discover')) {
      setBottomNavValue(1);
    } else if (pathname.endsWith('/journeys')) {
      setBottomNavValue(3);
    } else if (pathname.includes('/users/')) {
      setBottomNavValue(4);
    } else {
      setBottomNavValue(undefined);
    }
  }, [pathname]);

  if (!authenticated) return null;
  if (pathname.includes('/chapters/')) return null;

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
              title={dictionary.home}
              icon={<Home />}
              LinkComponent={Link}
              href={localePath('/')}
            />
            <BottomNavigationAction
              title={dictionary.discover}
              icon={<Explore />}
              LinkComponent={Link}
              href={localePath('/discover')}
            />
            <BottomNavigationAction
              title={dictionary['create new map']}
              icon={<AddBox color="secondary" />}
              onClick={openCreateMap}
            />
            <BottomNavigationAction
              title={dictionary['journey log']}
              icon={<DirectionsWalk />}
              LinkComponent={Link}
              href={localePath('/journeys')}
            />
            <BottomNavigationAction
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
              LinkComponent={profile ? Link : 'button'}
              href={profile ? localePath(`/users/${profile.id}`) : undefined}
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
