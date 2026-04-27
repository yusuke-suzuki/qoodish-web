import {
  Box,
  Divider,
  ImageList,
  ImageListItem,
  Skeleton,
  Stack
} from '@mui/material';
import { memo } from 'react';

const REVIEW_TILE_COUNT = 6;
const MAP_TILE_COUNT = 6;

function SectionHeader() {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
      <Skeleton variant="circular" width={24} height={24} />
      <Skeleton variant="text" width={120} />
    </Box>
  );
}

type GridSkeletonProps = {
  count: number;
  rowHeight: number;
  keyPrefix: string;
};

function GridSection({ count, rowHeight, keyPrefix }: GridSkeletonProps) {
  return (
    <Box component="section">
      <SectionHeader />
      <ImageList cols={3} rowHeight={rowHeight} gap={8} sx={{ m: 0 }}>
        {Array.from({ length: count }).map((_, index) => (
          <ImageListItem
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`${keyPrefix}-${index}`}
          >
            <Skeleton variant="rectangular" height="100%" />
          </ImageListItem>
        ))}
      </ImageList>
    </Box>
  );
}

function SkeletonDiscoverPage() {
  return (
    <Stack spacing={4} divider={<Divider />}>
      <Box component="section">
        <SectionHeader />
        <Skeleton variant="rectangular" height={240} />
      </Box>
      <GridSection
        count={REVIEW_TILE_COUNT}
        rowHeight={180}
        keyPrefix="skeleton-discover-recent-reviews"
      />
      <GridSection
        count={MAP_TILE_COUNT}
        rowHeight={240}
        keyPrefix="skeleton-discover-active-maps"
      />
      <GridSection
        count={MAP_TILE_COUNT}
        rowHeight={240}
        keyPrefix="skeleton-discover-recent-maps"
      />
    </Stack>
  );
}

export default memo(SkeletonDiscoverPage);
