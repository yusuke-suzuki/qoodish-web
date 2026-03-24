'use client';

import { Explore, FiberNew, Whatshot } from '@mui/icons-material';
import { Box, Divider, Stack, Typography } from '@mui/material';
import Layout from '../../../components/Layout';
import PickUpMap from '../../../components/discover/PickUpMap';
import MapGridList from '../../../components/maps/MapGridList';
import ReviewGridList from '../../../components/reviews/ReviewGridList';
import { useActiveMaps } from '../../../hooks/useActiveMaps';
import useDictionary from '../../../hooks/useDictionary';
import { useRecentMaps } from '../../../hooks/useRecentMaps';
import { useRecentReviews } from '../../../hooks/useRecentReviews';

export default function DiscoverPageClient() {
  const dictionary = useDictionary();
  const { reviews: recentReviews } = useRecentReviews();
  const { maps: activeMaps } = useActiveMaps();
  const { maps: recentMaps } = useRecentMaps();

  return (
    <Layout>
      <Stack spacing={4} divider={<Divider />}>
        <Box component="section">
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <Explore color="secondary" />
            <Typography variant="subtitle1">{dictionary['pick up']}</Typography>
          </Box>

          <PickUpMap />
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
