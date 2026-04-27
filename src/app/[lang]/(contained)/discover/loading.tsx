import { Box, Divider, Skeleton, Stack } from '@mui/material';

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

type GridSectionProps = {
  count: number;
  rowHeight: number;
  keyPrefix: string;
  cols: { xs: number; sm: number };
};

function GridSection({ count, rowHeight, keyPrefix, cols }: GridSectionProps) {
  return (
    <Box component="section">
      <SectionHeader />
      <Box
        sx={{
          display: 'grid',
          gap: 1,
          gridTemplateColumns: {
            xs: `repeat(${cols.xs}, 1fr)`,
            sm: `repeat(${cols.sm}, 1fr)`
          }
        }}
      >
        {Array.from({ length: count }).map((_, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`${keyPrefix}-${index}`}
            variant="rectangular"
            height={rowHeight}
          />
        ))}
      </Box>
    </Box>
  );
}

export default function Loading() {
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
        cols={{ xs: 2, sm: 3 }}
      />
      <GridSection
        count={MAP_TILE_COUNT}
        rowHeight={240}
        keyPrefix="skeleton-discover-active-maps"
        cols={{ xs: 1, sm: 3 }}
      />
      <GridSection
        count={MAP_TILE_COUNT}
        rowHeight={240}
        keyPrefix="skeleton-discover-recent-maps"
        cols={{ xs: 1, sm: 3 }}
      />
    </Stack>
  );
}
