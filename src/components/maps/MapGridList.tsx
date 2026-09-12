'use client';

import { Box } from '@mui/material';
import { memo } from 'react';
import type { AppMap } from '../../../types/index.ts';
import MapCard from './MapCard.tsx';

type Props = {
  maps: AppMap[];
  cols?: number;
};

function MapGridList({ maps, cols }: Props) {
  // Above a phone the columns follow the width the grid is actually given, so
  // the same list works in the main column and in the rail. A phone is narrower
  // than one of those columns, and a single column of cards makes a browsing
  // page as long to scroll as the rails on the landing were meant to avoid.
  const gridTemplateColumns = cols
    ? `repeat(${cols}, 1fr)`
    : {
        xs: 'repeat(2, 1fr)',
        sm: 'repeat(auto-fill, minmax(240px, 1fr))'
      };

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns }}>
      {maps.map((map) => (
        <MapCard key={map.id} map={map} />
      ))}
    </Box>
  );
}

export default memo(MapGridList);
