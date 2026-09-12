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
  // Columns follow the width the grid is actually given rather than the
  // viewport, so the same list works in the main column and in the rail.
  const gridTemplateColumns = cols
    ? `repeat(${cols}, 1fr)`
    : 'repeat(auto-fill, minmax(240px, 1fr))';

  return (
    <Box sx={{ display: 'grid', gap: 2, gridTemplateColumns }}>
      {maps.map((map) => (
        <MapCard key={map.id} map={map} />
      ))}
    </Box>
  );
}

export default memo(MapGridList);
