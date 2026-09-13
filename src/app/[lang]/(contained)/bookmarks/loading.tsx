import { Box, Card, Grid, Skeleton } from '@mui/material';

const TILE_COUNT = 6;
const TAB_COUNT = 2;
const tabBarHeight = 48;

export default function Loading() {
  return (
    <>
      {/* Plain boxes rather than Tabs: a skeleton must not expose focusable
          tab roles that carry no accessible name. */}
      <Card>
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

      {/* The sizes MapGridList gives the covers it draws. Skeleton keeps a
          1.2em height unless it is cleared, which would override the ratio. */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {Array.from({ length: TILE_COUNT }).map((_, index) => (
          <Grid
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`skeleton-bookmark-map-${index}`}
            size={{ xs: 12, sm: 6, lg: 4 }}
          >
            <Skeleton
              variant="rounded"
              sx={{ height: 'auto', aspectRatio: '16 / 9' }}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
