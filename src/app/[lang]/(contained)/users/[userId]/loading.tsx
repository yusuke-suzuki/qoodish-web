import {
  Box,
  Card,
  CardContent,
  Divider,
  Skeleton,
  Stack,
  Tab,
  Tabs
} from '@mui/material';

const REVIEW_TILE_COUNT = 6;

export default function Loading() {
  return (
    <>
      <Card elevation={0}>
        <CardContent>
          <Stack spacing={1} sx={{ placeItems: 'center' }}>
            <Skeleton variant="circular" width={100} height={100} />
            <Skeleton variant="text" width="40%" height={36} />
            <Skeleton variant="text" width="70%" />
            <Skeleton variant="text" width="50%" />

            <Stack
              direction="row"
              divider={<Divider orientation="vertical" flexItem />}
              spacing={2}
              sx={{ pt: 1 }}
            >
              <Stack alignItems="center" spacing={0.5}>
                <Skeleton variant="text" width={40} height={28} />
                <Skeleton variant="text" width={48} />
              </Stack>
              <Stack alignItems="center" spacing={0.5}>
                <Skeleton variant="text" width={40} height={28} />
                <Skeleton variant="text" width={48} />
              </Stack>
            </Stack>
          </Stack>
        </CardContent>

        <Tabs value={0} centered>
          <Tab label={<Skeleton variant="text" width={48} />} />
          <Tab label={<Skeleton variant="text" width={48} />} />
        </Tabs>
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
