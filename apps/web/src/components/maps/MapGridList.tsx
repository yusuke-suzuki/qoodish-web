'use client';

import { Grid } from '@mui/material';
import { memo } from 'react';
import type { AppMap } from '../../../types/index.ts';
import MapCard from './MapCard.tsx';

type Props = {
  maps: AppMap[];
  cols?: number;
};

// One column on a phone: the name is set on the cover, and half a phone's
// width leaves it too small to read.
const DEFAULT_SIZE = { xs: 12, sm: 6, lg: 4 };

function MapGridList({ maps, cols }: Props) {
  const size = cols ? 12 / cols : DEFAULT_SIZE;

  return (
    <Grid container spacing={2}>
      {maps.map((map) => (
        <Grid key={map.id} size={size}>
          <MapCard map={map} />
        </Grid>
      ))}
    </Grid>
  );
}

export default memo(MapGridList);
