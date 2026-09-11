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

// The legal links and the copyright used to close this rail. The footer now
// carries them under every page, so keeping them here printed both twice.
function Sidebar({ popularMaps, recommendMaps }: Props) {
  return (
    <Stack spacing={2}>
      {recommendMaps && (
        <>
          <RecommendMaps maps={recommendMaps} />

          <Divider />
        </>
      )}

      <TrendingMaps maps={popularMaps} />
    </Stack>
  );
}

export default memo(Sidebar);
