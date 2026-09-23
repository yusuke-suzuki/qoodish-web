'use client';

import { Box, Drawer, ListItemButton, Typography } from '@mui/material';
import Link from 'next/link';
import { memo, Suspense } from 'react';
import type { Profile } from '../../../types/index.ts';
import useNavDestinations, {
  type NavDestination
} from '../../hooks/useNavDestinations.ts';
import useProfile from '../../hooks/useProfile.ts';

const TOOLBAR_GUTTER = 24;
const ICON_BUTTON_EDGE_INSET = 12;
const ICON_BUTTON_PADDING = 8;
const MENU_ICON_SIZE = '1.5rem';

const MENU_ICON_CENTER = `calc(${
  TOOLBAR_GUTTER - ICON_BUTTON_EDGE_INSET + ICON_BUTTON_PADDING
}px + ${MENU_ICON_SIZE} / 2)`;

export const RAIL_WIDTH = `calc(2 * ${MENU_ICON_CENTER})`;

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
