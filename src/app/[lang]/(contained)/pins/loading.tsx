import { Box, Grid, Skeleton } from '@mui/material';

const TILE_COUNT = 12;
const SIZE = { xs: 6, sm: 4, md: 3 };

export default function Loading() {
  return (
    <>
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={160} sx={{ typography: 'h5' }} />
      </Box>

      <Grid container spacing={2}>
        {Array.from({ length: TILE_COUNT }).map((_, index) => (
          <Grid
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`skeleton-report-${index}`}
            size={SIZE}
          >
            {/* Skeleton keeps a 1.2em height unless it is cleared, which
                would override the aspect ratio. */}
            <Skeleton
              variant="rounded"
              sx={{ height: 'auto', aspectRatio: '1 / 1' }}
            />
            <Skeleton
              variant="text"
              width="80%"
              sx={{ typography: 'subtitle2', mt: 1 }}
            />
            <Skeleton
              variant="text"
              width="50%"
              sx={{ typography: 'caption' }}
            />
          </Grid>
        ))}
      </Grid>
    </>
  );
}
