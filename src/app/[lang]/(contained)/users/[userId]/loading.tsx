import {
  Box,
  Card,
  CardContent,
  Divider,
  Grid,
  Skeleton,
  Stack
} from '@mui/material';

const PIN_TILE_COUNT = 6;
const TAB_COUNT = 3;
const tabBarHeight = 48;

export default function Loading() {
  return (
    <>
      <Card>
        <CardContent>
          <Stack spacing={1.5}>
            <Skeleton variant="circular" width={96} height={96} />

            <Skeleton variant="text" width="55%" height={32} />

            <Skeleton variant="text" width="80%" />

            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={3}
            >
              <Box>
                <Skeleton variant="text" width={40} height={28} />
                <Skeleton variant="text" width={48} />
              </Box>
              <Box>
                <Skeleton variant="text" width={40} height={28} />
                <Skeleton variant="text" width={48} />
              </Box>
              <Box>
                <Skeleton variant="text" width={40} height={28} />
                <Skeleton variant="text" width={48} />
              </Box>
            </Stack>

            <Skeleton variant="rounded" height={36} />
          </Stack>
        </CardContent>

        {/* Plain boxes rather than Tabs: a skeleton must not expose focusable
            tab roles that carry no accessible name. */}
        <Box
          sx={{
            height: tabBarHeight,
            display: 'flex',
            alignItems: 'center',
            gap: 4,
            px: 2
          }}
        >
          {Array.from({ length: TAB_COUNT }).map((_, index) => (
            <Skeleton
              // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
              key={`skeleton-profile-tab-${index}`}
              variant="text"
              width={48}
            />
          ))}
        </Box>
      </Card>

      {/* The sizes PinGridList gives the photographs it draws. Skeleton
          keeps a 1.2em height unless it is cleared, which would override the
          aspect ratio. */}
      <Grid container spacing={2} sx={{ mt: 2 }}>
        {Array.from({ length: PIN_TILE_COUNT }).map((_, index) => (
          <Grid
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`skeleton-profile-pin-${index}`}
            size={{ xs: 6, sm: 4, md: 3 }}
          >
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
