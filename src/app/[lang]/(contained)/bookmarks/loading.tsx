import { Box, Card, Skeleton } from '@mui/material';

const TILE_COUNT = 6;
const TAB_COUNT = 2;
const tileHeight = 240;
const tabBarHeight = 48;

export default function Loading() {
  return (
    <>
      {/* Plain boxes rather than Tabs: a skeleton must not expose focusable
          tab roles that carry no accessible name. */}
      <Card elevation={0}>
        <Box
          sx={{
            height: tabBarHeight,
            display: 'grid',
            gridTemplateColumns: `repeat(${TAB_COUNT}, 1fr)`,
            alignItems: 'center',
            justifyItems: 'center'
          }}
        >
          {Array.from({ length: TAB_COUNT }).map((_, index) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              key={`skeleton-bookmark-tab-${index}`}
              variant="text"
              width={48}
            />
          ))}
        </Box>
      </Card>

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gap: 1,
          gridTemplateColumns: { xs: 'repeat(1, 1fr)', sm: 'repeat(3, 1fr)' }
        }}
      >
        {Array.from({ length: TILE_COUNT }).map((_, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`skeleton-bookmark-map-${index}`}
            variant="rectangular"
            height={tileHeight}
          />
        ))}
      </Box>
    </>
  );
}
