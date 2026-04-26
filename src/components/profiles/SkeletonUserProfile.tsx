import {
  Card,
  CardContent,
  Divider,
  ImageList,
  ImageListItem,
  Skeleton,
  Stack,
  Tab,
  Tabs
} from '@mui/material';
import { memo } from 'react';

const REVIEW_TILE_COUNT = 6;

function SkeletonUserProfile() {
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

      <ImageList cols={3} rowHeight={180} gap={8} sx={{ mt: 2 }}>
        {Array.from({ length: REVIEW_TILE_COUNT }).map((_, index) => (
          <ImageListItem
            // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
            key={`skeleton-profile-review-${index}`}
          >
            <Skeleton variant="rectangular" height="100%" />
          </ImageListItem>
        ))}
      </ImageList>
    </>
  );
}

export default memo(SkeletonUserProfile);
