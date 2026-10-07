import { Box, Grid, Skeleton } from '@mui/material';

type Props = {
  keyPrefix: string;
  count: number;
};

const SIZE = { xs: 6, sm: 4, md: 3 };

export default function PinGridSkeleton({ keyPrefix, count }: Props) {
  return (
    <Box component="section">
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
        <Skeleton variant="circular" width={24} height={24} />
        <Skeleton variant="text" width={140} sx={{ typography: 'subtitle1' }} />
        <Skeleton
          variant="rounded"
          width={72}
          height={30}
          sx={{ ml: 'auto' }}
        />
      </Box>

      <Grid container spacing={2}>
        {Array.from({ length: count }).map((_, index) => (
          <Grid
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`${keyPrefix}-${index}`}
            size={SIZE}
          >
            {/* Skeleton keeps a 1.2em height unless it is cleared, which would
                override the aspect ratio. */}
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
    </Box>
  );
}
