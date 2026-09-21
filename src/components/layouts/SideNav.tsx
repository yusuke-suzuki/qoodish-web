'use client';

import { Box, Drawer, ListItemButton, Typography } from '@mui/material';
import Link from 'next/link';
import { memo, Suspense } from 'react';
import type { Profile } from '../../../types/index.ts';
import useNavDestinations, {
  type NavDestination
} from '../../hooks/useNavDestinations.ts';
import useProfile from '../../hooks/useProfile.ts';

// The toolbar's own padding puts the menu icon 32px from the edge, and the
// rail's icons read as that button's column continued down the page.
export const RAIL_WIDTH = 64;

type ContentProps = {
  profile: Profile | null;
};

function RailItem({ destination }: { destination: NavDestination }) {
  const Icon = destination.icon;

  return (
    <ListItemButton
      selected={destination.selected}
      disabled={destination.disabled}
      LinkComponent={destination.href ? Link : 'button'}
      href={destination.href}
      title={destination.label}
      sx={{
        flexDirection: 'column',
        gap: 0.5,
        borderRadius: 2,
        mx: 0.5,
        px: 0,
        py: 1.5
      }}
    >
      <Icon fontSize="small" />

      <Typography
        variant="caption"
        noWrap
        sx={{ maxWidth: '100%', fontSize: 10 }}
      >
        {destination.label}
      </Typography>
    </ListItemButton>
  );
}

function SideNavContent({ profile }: ContentProps) {
  const destinations = useNavDestinations(profile);

  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', md: 'block' },
        width: RAIL_WIDTH,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: RAIL_WIDTH,
          // A drawer outranks the bar by default, which would leave the bar's
          // bottom border drawn over the page but not over the rail.
          zIndex: (theme) => theme.zIndex.appBar - 1,
          top: 'var(--chrome-top)',
          height: 'calc(100% - var(--chrome-top))',
          overflowX: 'hidden',
          borderRight: 0
        }
      }}
    >
      <Box component="nav" sx={{ py: 1 }}>
        {destinations
          .filter((destination) => destination.primary)
          .map((destination) => (
            <RailItem key={destination.key} destination={destination} />
          ))}
      </Box>
    </Drawer>
  );
}

function SideNavWithProfile() {
  return <SideNavContent profile={useProfile()} />;
}

export default memo(function SideNav() {
  return (
    <Suspense fallback={<SideNavContent profile={null} />}>
      <SideNavWithProfile />
    </Suspense>
  );
});
