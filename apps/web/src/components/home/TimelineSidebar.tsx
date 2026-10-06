'use client';

import { Divider, Stack } from '@mui/material';
import { memo } from 'react';
import type { AppMap } from '../../../types/index.ts';
import RecommendMaps from './RecommendMaps.tsx';
import TrendingMaps from './TrendingMaps.tsx';

type Props = {
  popularMaps?: AppMap[];
  recommendMaps?: AppMap[];
};

function TimelineSidebar({ popularMaps, recommendMaps }: Props) {
  return (
    <Stack spacing={2}>
      {recommendMaps && recommendMaps.length > 0 && (
        <>
          <RecommendMaps maps={recommendMaps} />

          <Divider />
        </>
      )}

      <TrendingMaps maps={popularMaps} />
    </Stack>
  );
}

export default memo(TimelineSidebar);
