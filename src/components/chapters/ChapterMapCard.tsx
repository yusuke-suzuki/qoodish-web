'use client';

import { Map as MapIcon } from '@mui/icons-material';
import {
  Avatar,
  Box,
  Divider,
  Link as MuiLink,
  Typography
} from '@mui/material';
import Link from 'next/link';
import { type ReactNode, memo } from 'react';
import type { AppMap, JourneyPathPoint, Spot } from '../../../types';
import useDictionary from '../../hooks/useDictionary';
import JourneyMap from '../journeys/JourneyMap';

type Props = {
  map: AppMap | null;
  // Only read when the map is absent: a deleted map leaves no row behind,
  // while a private one is merely out of this reader's reach.
  mapDeleted?: boolean;
  spots: Spot[];
  fallbackCenter?: JourneyPathPoint;
  locale: string;
  children?: ReactNode;
};

function ChapterMapCard({
  map,
  mapDeleted,
  spots,
  fallbackCenter,
  locale,
  children
}: Props) {
  const dictionary = useDictionary();

  return (
    <Box sx={{ mt: 6 }}>
      <Divider sx={{ mb: 4 }} />

      <Box sx={{ borderRadius: 1, overflow: 'hidden', mb: 3 }}>
        <JourneyMap
          spots={spots}
          path={[]}
          locale={locale}
          fallbackCenter={fallbackCenter}
        />
      </Box>

      {children && <Box sx={{ mb: 3 }}>{children}</Box>}

      <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
        <Avatar
          variant="rounded"
          src={map?.image?.avatar}
          alt={map?.name}
          sx={{ width: 56, height: 56 }}
        >
          <MapIcon />
        </Avatar>

        <Box sx={{ flex: 1, minWidth: 0 }}>
          {map ? (
            <>
              <MuiLink
                underline="hover"
                color="inherit"
                component={Link}
                href={`/${locale}/maps/${map.id}`}
              >
                <Typography variant="h6" component="p">
                  {map.name}
                </Typography>
              </MuiLink>

              {map.description && (
                <Typography variant="body2" sx={{ mt: 1 }}>
                  {map.description}
                </Typography>
              )}
            </>
          ) : (
            <Typography variant="h6" component="p" color="text.secondary">
              {mapDeleted
                ? dictionary['deleted map']
                : dictionary['private map']}
            </Typography>
          )}
        </Box>
      </Box>
    </Box>
  );
}

export default memo(ChapterMapCard);
