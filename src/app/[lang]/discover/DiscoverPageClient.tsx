'use client';

import { Explore, FiberNew, Whatshot } from '@mui/icons-material';
import { Box, Divider, Stack, Typography } from '@mui/material';
import type { AppMap, Review } from '../../../../types';
import Layout from '../../../components/Layout';
import PickUpMap from '../../../components/discover/PickUpMap';
import Sidebar from '../../../components/layouts/Sidebar';
import MapGridList from '../../../components/maps/MapGridList';
import ReviewGridList from '../../../components/reviews/ReviewGridList';
import useDictionary from '../../../hooks/useDictionary';

type Props = {
  recentReviews: Review[];
  activeMaps: AppMap[];
  recentMaps: AppMap[];
  popularMaps: AppMap[];
  pickUpMap: AppMap | null;
};

export default function DiscoverPageClient({
  recentReviews,
  activeMaps,
  recentMaps,
  popularMaps,
  pickUpMap
}: Props) {
  const dictionary = useDictionary();

  return (
    <Layout sidebar={<Sidebar popularMaps={popularMaps} />}>
      <Stack spacing={4} divider={<Divider />}>
        <Box component="section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Explore color="secondary" />
            <Typography variant="subtitle1">{dictionary['pick up']}</Typography>
          </Box>

          <PickUpMap map={pickUpMap} />
        </Box>

        <Box component="section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FiberNew color="secondary" />
            <Typography variant="subtitle1">
              {dictionary['recent reports']}
            </Typography>
          </Box>

          <ReviewGridList reviews={recentReviews} />
        </Box>

        <Box component="section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Whatshot color="secondary" />
            <Typography variant="subtitle1">
              {dictionary['active maps']}
            </Typography>
          </Box>

          <MapGridList maps={activeMaps} />
        </Box>

        <Box component="section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FiberNew color="secondary" />
            <Typography variant="subtitle1">
              {dictionary['recent maps']}
            </Typography>
          </Box>

          <MapGridList maps={recentMaps} />
        </Box>
      </Stack>
    </Layout>
  );
}
