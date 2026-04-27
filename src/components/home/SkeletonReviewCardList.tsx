import {
  Box,
  Card,
  CardActions,
  CardContent,
  CardHeader,
  Skeleton
} from '@mui/material';
import { memo } from 'react';

const PLACEHOLDER_COUNT = 3;

function SkeletonReviewCardList() {
  return (
    <Box sx={{ display: 'grid', gap: 3 }}>
      {Array.from({ length: PLACEHOLDER_COUNT }).map((_, index) => (
        <Card
          // biome-ignore lint/suspicious/noArrayIndexKey: static skeleton list
          key={`skeleton-review-card-${index}`}
          elevation={0}
        >
          <CardHeader
            avatar={<Skeleton variant="circular" width={40} height={40} />}
            title={<Skeleton width="40%" />}
            subheader={<Skeleton width="25%" />}
            action={<Skeleton variant="circular" width={32} height={32} />}
          />
          <CardContent sx={{ pt: 0 }}>
            <Skeleton variant="text" height={32} width="60%" />
            <Skeleton variant="text" />
            <Skeleton variant="text" width="80%" />
          </CardContent>
          <Skeleton variant="rectangular" height={240} />
          <CardActions>
            <Skeleton variant="circular" width={32} height={32} />
            <Skeleton variant="circular" width={32} height={32} />
          </CardActions>
        </Card>
      ))}
    </Box>
  );
}

export default memo(SkeletonReviewCardList);
