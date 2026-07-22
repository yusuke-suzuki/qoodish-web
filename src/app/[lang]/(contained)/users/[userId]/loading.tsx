import {
  Box,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack
} from '@mui/material';

const REVIEW_TILE_COUNT = 6;
const TAB_COUNT = 3;
const tabBarHeight = 48;

export default function Loading() {
  return (
    <>
      <Card elevation={0}>
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

      <Box
        sx={{
          mt: 2,
          display: 'grid',
          gap: 1,
          gridTemplateColumns: { xs: 'repeat(2, 1fr)', sm: 'repeat(3, 1fr)' }
        }}
      >
        {Array.from({ length: REVIEW_TILE_COUNT }).map((_, index) => (
          <Skeleton
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`skeleton-profile-review-${index}`}
            variant="rectangular"
            height={180}
          />
        ))}
      </Box>
    </>
  );
}
